import _ from "lodash";
import { PINATA_API_KEY, PINATA_SECRET_KEY } from "../../../configserver";
import { uploadFileToPinata, uploadMetadataToPinata } from "./pinata";

export const createAndUploadNftMetadata = async (
  name: string,
  description: string,
  imageBuffer: Buffer,
  originalImageName: string,
  attributes?: string
) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw {
        error: "Bad Request",
        message: "Pinata API keys are not configured in environment variables.",
      };
    }

    // 2. --- Upload Image to Pinata ---
    const imageFileName = `nft-image-${Date.now()}.${originalImageName
      .split(".")
      .pop()}`;

    console.log("Uploading image to Pinata...");

    const imageHash = await uploadFileToPinata(imageBuffer, imageFileName);
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

    // 3. --- Parse Attributes ---
    let parsedAttributes = [];

    if (_.isObject(attributes)) {
      parsedAttributes = attributes;
    } else if (
      _.isString(attributes) &&
      /^[{\[].*[}\]]$/.test(attributes.trim())
    ) {
      parsedAttributes = JSON.parse(attributes);
    }

    // 4. --- Construct Metadata ---
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: parsedAttributes,
    };

    // 5. --- Upload Metadata JSON to Pinata ---
    console.log("Uploading metadata to Pinata...");

    const metadataHash = await uploadMetadataToPinata(
      metadata,
      `nft-metadata-${Date.now()}`
    );

    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

    // 6. --- Return Successful Result ---
    return {
      success: true,
      metadataUrl,
      imageUrl,
      metadata,
      message: "Metadata uploaded successfully! Ready to mint.",
    };
  } catch (error) {
    console.error("Failed to create and upload NFT metadata:", error);
    throw error;
  }
};
