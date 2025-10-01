import { Op } from "sequelize";
import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";
import _ from "lodash";
import axios from "axios";
import { createAndUploadNftMetadata } from "../client/nft";

export const _getAllBatchesByProduct = async (product_id: number) => {
  try {
    const Batch = getInstance(collectionNames.BATCHES);
    const batches = await Batch.findAll({
      where: {
        product_id,
      },
      attributes: {
        exclude: ["deletedAt", "updatedAt", "lockVersion"],
      },
    });

    return batches;
  } catch (error) {
    throw error;
  }
};

export const _createBatch = async (payload: {
  start: string;
  end: string;
  total_units: number;
  uid: string;
  product_id: number;
}) => {
  try {
    const AuthCode = getInstance(collectionNames.AUTCHODES);
    const Batch = getInstance(collectionNames.BATCHES);
    const Product = getInstance(collectionNames.PRODUCT);
    const ProductAsset = getInstance(collectionNames.PRODUCT_ASSETS);
    const auth_len = payload.start === payload.end ? 1 : 2;

    const _authcodes = await AuthCode.findAll({
      where: {
        authcode: { [Op.in]: [payload.start, payload.end] },
      },
      attributes: ["id", "authcode"],
      raw: true,
    });

    if (_authcodes.length !== auth_len) {
      throw {
        message: "Invalid Batch Range",
        error: "Bad Request",
      };
    }

    let product = await Product.findOne({
      where: {
        id: payload.product_id,
      },
      include: {
        model: ProductAsset,
      },
    });

    if (!product) {
      throw {
        message: "Invalid Product",
        error: "Bad Request",
      };
    }
    product = product.toJSON();

    const startIndx = _.find(_authcodes, (e) => e.authcode === payload.start);
    const endIndx = _.find(_authcodes, (e) => e.authcode === payload.end);

    console.log(startIndx);

    const existingranges = await checkExistingBatchRanges(startIndx, endIndx);

    if (!_.isEmpty(existingranges)) {
      throw {
        message: "Batch Range already exists",
        error: "Bad Request",
      };
    }

    const batch = await Batch.create(payload);

    await addBatchRangeLogs(startIndx, endIndx, batch.id);

    const img = await axios.get(product?.product_assets?.[0]?.url, {
      responseType: "arraybuffer",
    });
    const imgBuffer = Buffer.from(img.data);

    const { metadata, metadataUrl } = await createAndUploadNftMetadata(
      product.title,
      product.description,
      imgBuffer,
      product?.product_assets?.[0]?.type
    );

    return {
      message: `Batch added sucessfully`,
      batch_id: batch.id,
      metadata,
      metadataUrl,
    };
  } catch (error) {
    throw error;
  }
};

const checkExistingBatchRanges = async (
  start: { id: number },
  end: { id: number }
) => {
  try {
    const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);
    const AuthCode = getInstance(collectionNames.AUTCHODES);

    const authCodes = await AuthCode.findAll({
      where: { id: { [Op.between]: [start.id, end.id] } },
      attributes: ["authcode"],
      raw: true,
    });

    return BatchRangeLog.findAll({
      where: {
        authcode: {
          [Op.in]: authCodes.map((e: { authcode: string }) => e.authcode),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

const addBatchRangeLogs = async (
  start: { id: number },
  end: { id: number },
  batch_id: number
) => {
  try {
    const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);
    const AuthCode = getInstance(collectionNames.AUTCHODES);

    let rangeLogPayload: { batch_id: number; authcode: string }[] = [];

    const authCodes = await AuthCode.findAll({
      where: { id: { [Op.between]: [start.id, end.id] } },
    });

    authCodes.map((e: { authcode: string }) => {
      let obj = {
        batch_id,
        authcode: e.authcode,
      };

      rangeLogPayload.push(obj);
    });

    return BatchRangeLog.bulkCreate(rangeLogPayload);
  } catch (error) {
    throw error;
  }
};
