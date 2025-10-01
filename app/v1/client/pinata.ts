import axios from "axios";
import FormData from "form-data";
import { PINATA_API_KEY, PINATA_SECRET_KEY } from "../../../configserver";

/**
 * Upload a file to Pinata
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @returns {Promise<string>} - The IPFS hash of the uploaded file
 */
export async function uploadFileToPinata(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", fileBuffer, fileName);

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      type: "nft-image",
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response?.data?.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

/**
 * Upload JSON metadata to Pinata
 * @param {Object} metadata - The metadata object to upload
 * @param {string} name - The name for the metadata file
 * @returns {Promise<string>} - The IPFS hash of the uploaded metadata
 */
export async function uploadMetadataToPinata(
  metadata: object,
  name: string
): Promise<string> {
  const data = JSON.stringify({
    pinataContent: metadata,
    pinataMetadata: {
      name: name,
      keyvalues: {
        type: "nft-metadata",
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  });

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response?.data?.IpfsHash;
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw error;
  }
}
