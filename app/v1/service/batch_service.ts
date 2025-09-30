import { collectionNames } from "../../../configserver";
import { getInstance } from "../helpers/databaseStorageHelper";

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
