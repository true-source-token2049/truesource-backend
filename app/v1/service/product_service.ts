import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";

export const _getAllProducts = async (limit?: number, offset?: number) => {
  try {
    const Product = getInstance(collectionNames.PRODUCT);
    const ProductAsset = getInstance(collectionNames.PRODUCT_ASSETS);
    const ProductAttr = getInstance(collectionNames.PRODUCT_ATTRIBUTES);

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
      ],
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
