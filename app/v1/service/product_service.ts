import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";

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

export const _createProduct = async (
  _payload: Omit<ProductInterface, "id"> & {
    attrs: { name: string; value: string; type: string }[];
    assets: { url: string; type: string; view: string }[];
  }
) => {
  try {
    const Product = getInstance(collectionNames.PRODUCT);
    const ProductAttributes = getInstance(collectionNames.PRODUCT_ATTRIBUTES);
    const ProductAssets = getInstance(collectionNames.PRODUCT_ASSETS);

    const product = await Product.create(_payload, {
      include: [ProductAttributes, ProductAssets],
    });
    return { message: "Product created successfully", id: product.id };
  } catch (e) {
    throw e;
  }
};
