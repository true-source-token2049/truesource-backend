import _ from "lodash";
import {
  NEXT_PUBLIC_ALCHEMY_API_KEY,
  NEXT_PUBLIC_CONTRACT_ADDRESS,
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
} from "../../../configserver";
import { uploadFileToPinata, uploadMetadataToPinata } from "./pinata";
import { ethers } from "ethers";

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

export const attestNFT = async (
  tokenId: string,
  value: string,
  note: string,
  privateKey: string
) => {
  try {
    const EDITABLE_NFT_ABI = [
      "function attestNFT(uint256 tokenId, uint256 value, string memory note) public",
      "function getAttestations(uint256 tokenId) public view returns (tuple(address attester, uint256 value, string note, uint256 timestamp)[])",
      "function ownerOf(uint256 tokenId) public view returns (address)",
      "function exists(uint256 tokenId) public view returns (bool)",
    ];

    if (!tokenId || value === undefined || !note || !privateKey) {
      throw {
        error: "Bad Request",
        message: "Token ID, value, note, and private key are required",
      };
    }

    const provider = new ethers.AlchemyProvider(
      "sepolia",
      NEXT_PUBLIC_ALCHEMY_API_KEY
    );

    const wallet = new ethers.Wallet(privateKey, provider);

    const contractAddress = NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw {
        error: "Bad Request",
        message: "Contract address not configured",
      };
    }

    const contract = new ethers.Contract(
      contractAddress,
      EDITABLE_NFT_ABI,
      wallet
    );

    const exists: boolean = await contract.exists(tokenId);
    if (!exists) {
      throw {
        error: "Bad Request",
        message: "Token does not exist",
      };
    }

    const owner: string = await contract.ownerOf(tokenId);
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw {
        error: "Bad Request",
        message: "Only the owner can attest this NFT",
      };
    }

    const tx = await contract.attestNFT(tokenId, value, note);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
      attester: wallet.address,
      value: value.toString(),
      note,
    };
  } catch (error) {
    throw error;
  }
};
