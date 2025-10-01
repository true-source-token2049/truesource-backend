import _ from "lodash";
import { cloudinaryConfig, collectionNames } from "../../../configserver";
import { getRandom } from "../helpers/cryptoHelper";
import { getInstance } from "../helpers/databaseStorageHelper";
import { v2 as cloudinary } from "cloudinary";
import mime from "mime-types";
import { UploadedFile } from "express-fileupload";

cloudinary.config({
  cloud_name: cloudinaryConfig.name,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
});

export interface ProductInterface {
  id: string;
  title: string;
  brand: string;
  category: string;
  sub_category: string;
  description: string;
  plain_description: string;
  price: number;
}
export const _getAllProducts = async (limit?: number, offset?: number) => {
  try {
    const Product = getInstance(collectionNames.PRODUCT);
    const ProductAsset = getInstance(collectionNames.PRODUCT_ASSETS);
    const ProductAttr = getInstance(collectionNames.PRODUCT_ATTRIBUTES);
    const Batches = getInstance(collectionNames.BATCHES);

    const products = await Product.findAll({
      attributes: {
        exclude: ["deletedAt", "updatedAt", "lockVersion"],
      },
      include: [
        {
          model: ProductAsset,
          attributes: {
            exclude: [
              "createdAt",
              "deletedAt",
              "updatedAt",
              "lockVersion",
              "product_id",
            ],
          },
        },
        {
          model: ProductAttr,
          attributes: {
            exclude: [
              "createdAt",
              "deletedAt",
              "updatedAt",
              "lockVersion",
              "product_id",
            ],
          },
        },
        {
          model: Batches,
          attributes: ["id", "available_units"],
          required: false,
        },
      ],
      order: [[Batches, "available_units", "DESC NULLS LAST"]],
    });

    return products;
  } catch (error) {
    throw error;
  }
};

export const _getProductById = async (id: number) => {
  try {
    const Product = getInstance(collectionNames.PRODUCT);
    const ProductAsset = getInstance(collectionNames.PRODUCT_ASSETS);
    const ProductAttr = getInstance(collectionNames.PRODUCT_ATTRIBUTES);

    const product = await Product.findOne({
      where: { id },
      attributes: {
        exclude: ["deletedAt", "updatedAt", "lockVersion"],
      },
      include: [
        {
          model: ProductAsset,
          attributes: {
            exclude: [
              "createdAt",
              "deletedAt",
              "updatedAt",
              "lockVersion",
              "product_id",
            ],
          },
        },
        {
          model: ProductAttr,
          attributes: {
            exclude: [
              "createdAt",
              "deletedAt",
              "updatedAt",
              "lockVersion",
              "product_id",
            ],
          },
        },
      ],
    });

    if (!product) {
      throw {
        error: "Bad Request",
        message: "Product Not Found",
      };
    }

    return product;
  } catch (error) {
    throw error;
  }
};

export const _createProduct = async (
  _payload: Omit<ProductInterface, "id"> & {
    product_attrs: { name: string; value: string; type: string }[];
    product_assets: { url: string; type: string; view: string }[];
  }
) => {
  try {
    const Product = getInstance(collectionNames.PRODUCT);
    const ProductAttributes = getInstance(collectionNames.PRODUCT_ATTRIBUTES);
    const ProductAssets = getInstance(collectionNames.PRODUCT_ASSETS);

    const product = await Product.create(_payload, {
      include: [ProductAttributes, ProductAssets],
    });

    return {
      message: "Product created successfully",
      id: product.id,
    };
  } catch (e) {
    throw e;
  }
};

export const uploadToCloudinary = (
  name: string,
  folder = "products",
  file: UploadedFile | UploadedFile[],
  mimeType: string
): Promise<{ secure_url: string }> => {
  // Handle array of files - take the first one
  const uploadFile = Array.isArray(file) ? file[0] : file;

  console.log("Came here", {
    format: mime.extension(mimeType) as string,
    resource_type: "auto",
    public_id: _.isUndefined(name) ? getRandom() : name, // Fixed logic here too
    folder,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        format: mime.extension(mimeType) as string,
        resource_type: "auto",
        public_id: _.isUndefined(name) ? getRandom() : name, // Fixed logic here too
        folder,
      },
      (error, result) => {
        console.log(error, result);
        if (error) {
          reject({ error, message: "Unable to upload the image" });
          return;
        }

        const ext = mime.extension(mimeType);

        if (result && "secure_url" in result && result.secure_url) {
          if (ext === "png" || ext === "jpeg" || ext === "jpg") {
            result.secure_url = _.replace(
              result.secure_url,
              "upload/",
              "upload/fl_lossy,f_auto/"
            );
          } else if (ext === "mp4") {
            result.secure_url = _.replace(
              result.secure_url,
              "upload/",
              "upload/q_auto:best/f_auto/"
            );
          }
          resolve({ secure_url: result.secure_url });
        } else {
          reject({
            error: "No secure_url returned",
            message: "Unable to upload the image",
          });
        }
      }
    );

    // Pipe the file buffer to the upload stream
    uploadStream.end(uploadFile.data);
  });
};
