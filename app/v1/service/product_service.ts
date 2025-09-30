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
