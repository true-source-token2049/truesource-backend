import { Op } from "sequelize";
import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";
import _ from "lodash";
import axios from "axios";
import { attestNFT, createAndUploadNftMetadata } from "../client/nft";

export const _getAllBatchesByProduct = async (product_id: number) => {
  try {
    const Batch = getInstance(collectionNames.BATCHES);
    const BatchBlock = getInstance(collectionNames.BATCH_BLOCK);
    const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);
    const batches = await Batch.findAll({
      where: {
        product_id,
      },
      attributes: {
        exclude: ["deletedAt", "updatedAt", "lockVersion"],
      },
      include: [
        {
          model: BatchBlock,
        },
        {
          model: BatchRangeLog,
          attributes: ["nft_token_id", "authcode", "order_item_id"],
        },
      ],
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

export const _updateBatchNFT = async (payload: {
  nft_token_ids: [string];
  nft_transaction_hash: string;
  batch_id: number;
}) => {
  try {
    const Batch = getInstance(collectionNames.BATCHES);
    const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);

    const batch = await Batch.findOne({
      where: {
        id: payload.batch_id,
      },
      raw: true,
    });

    if (batch.total_units !== payload.nft_token_ids.length) {
      throw {
        message: "Total Units are insufficient",
        error: "Bad Request",
      };
    }

    const logs = await BatchRangeLog.findAll({
      where: { batch_id: payload.batch_id },
      order: [["id", "ASC"]],
    });

    if (logs.length !== payload.nft_token_ids.length) {
      throw {
        message: "Total Units are insufficient",
        error: "Bad Request",
      };
    }

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const tokenId = payload?.nft_token_ids[i];

      log.nft_token_id = tokenId;
      log.nft_transaction_hash = payload.nft_transaction_hash;
      await log.save();
    }

    await Batch.update(
      { nft_minting_status: "completed" },
      {
        where: {
          id: payload.batch_id,
        },
      }
    );

    return {
      message: "Batch NFT update successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const _addBlockToBatch = async (payload: {
  transactionHash: string;
  type: string;
  batch_id: number;
}) => {
  try {
    const BatchBlock = getInstance(collectionNames.BATCH_BLOCK);
    await BatchBlock.update(
      Object.assign(
        {},
        payload.type === "manufacturer" && {
          manufacturer_transaction_hash: payload.transactionHash,
        },
        payload.type === "retailer" && {
          retailer_transaction_hash: payload.transactionHash,
        },
        payload.type === "distributor" && {
          distributor_transaction_hash: payload.transactionHash,
        }
      ),
      {
        where: {
          batch_id: payload.batch_id,
        },
      }
    );
    return { message: "Block succesfully added" };
  } catch (e) {
    throw e;
  }
};
export const _attestBatchByAdmin = async (
  payload: {
    privateKey: string;
    batch_id: number;
  },
  type: string
) => {
  try {
    const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);
    const BatchBlock = getInstance(collectionNames.BATCH_BLOCK);

    const batchrangelog = await BatchRangeLog.findOne({
      where: {
        batch_id: payload.batch_id,
      },
      order: [["id", "ASC"]],
      raw: true,
    });

    if (!batchrangelog) {
      throw {
        message: "Invalid Batch Id",
        error: "Bad Request",
      };
    }

    const { transactionHash } = await attestNFT(
      batchrangelog.nft_token_id,
      `Verified Batch by ${type}`,
      `Verified Batch by ${type}`,
      payload.privateKey
    );

    await BatchBlock.update(
      Object.assign(
        {},
        type === "manufacturer" && {
          manufacturer_transaction_hash: transactionHash,
        },
        type === "retailer" && {
          retailer_transaction_hash: transactionHash,
        },
        type === "distributor" && {
          distributor_transaction_hash: transactionHash,
        }
      ),
      {
        where: {
          batch_id: payload.batch_id,
        },
      }
    );

    return {
      message: "Attest Batch Successfully",
      transactionHash,
    };
  } catch (error) {
    throw error;
  }
};

export const _verifyAuthCode = async (authcode: string) => {
  try {
    const BatchRangeLog = getInstance(collectionNames.BATCH_RANGE_LOG);
    const Batch = getInstance(collectionNames.BATCHES);
    const Product = getInstance(collectionNames.PRODUCT);
    const ProductAsset = getInstance(collectionNames.PRODUCT_ASSETS);
    const ProductAttr = getInstance(collectionNames.PRODUCT_ATTRIBUTES);
    const BatchBlock = getInstance(collectionNames.BATCH_BLOCK);

    let result = await BatchRangeLog.findOne({
      where: { authcode },
      attributes: {
        exclude: ["deletedAt", "updatedAt", "lockVersion", "batch_id"],
      },
      include: {
        model: Batch,
        attributes: {
          exclude: [
            "deletedAt",
            "updatedAt",
            "lockVersion",
            "createdAt",
            "product_id",
          ],
        },
        include: [
          {
            model: Product,
            attributes: {
              exclude: ["deletedAt", "updatedAt", "lockVersion", "createdAt"],
            },
            include: [
              {
                model: ProductAsset,
                attributes: {
                  exclude: [
                    "deletedAt",
                    "updatedAt",
                    "lockVersion",
                    "createdAt",
                    "product_id",
                  ],
                },
              },
              {
                model: ProductAttr,
                attributes: {
                  exclude: [
                    "deletedAt",
                    "updatedAt",
                    "lockVersion",
                    "createdAt",
                    "product_id",
                  ],
                },
              },
            ],
          },
          {
            model: BatchBlock,
            attributes: {
              exclude: ["deletedAt", "updatedAt", "lockVersion", "createdAt"],
            },
          },
        ],
      },
    });

    if (!result) {
      throw {
        message: "Invalid authcode",
        error: "Bad Request",
      };
    }

    result = result.toJSON();
    result.number_of_views += 1;
    const number_of_views = result.number_of_views;

    await BatchRangeLog.update(
      {
        number_of_views,
      },
      {
        where: {
          authcode,
        },
      }
    );

    return result;
  } catch (error) {
    throw error;
  }
};

export const _getNFTTokenId = async (authcode: string) => {
  try {
    const AuthCode = getInstance(collectionNames.AUTCHODES);
    return AuthCode.findOne({ where: { authcode }, attributes: ["id"] });
  } catch (error) {
    throw error;
  }
};

export const _getUserNFTs = async (id: number) => {
  try {
    const UserCollections = getInstance(collectionNames.USER_COLLECTION);
    return UserCollections.findAll({ where: { user_id: id } });
  } catch (error) {
    throw error;
  }
};
