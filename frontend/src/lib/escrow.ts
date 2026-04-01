import { create } from '@web3-storage/w3up-client';
import { ethers } from 'ethers';
import { encryptForClient } from './lit';

// ProofPayEscrow ABI snippet for submitProof and jobs
const ESCROW_ABI = [
  "function submitProof(uint256 jobId, string calldata ipfsHash) external",
  "function jobs(uint256) external view returns (address client, address freelancer, uint256 totalAmount, uint256 releasedAmount, uint256 createdAt, uint256 acceptedAt, uint256 proofSubmittedAt, uint8 status, string proofHash, string jobTitle)"
];

const ESCROW_ADDRESS = "0x32fb4173bb3f8f0dfbcd39c7a5ba8b0daf13ad24";

/**
 * Encrypts a file with Lit Protocol for the client, uploads to Storacha, 
 * and attaches the CID to a milestone (job) in ProofPayEscrow.
 * 
 * @param file The file to upload.
 * @param jobId The ID of the job/milestone in the contract.
 * @param signer An ethers Signer to authorize the contract transaction.
 * @returns The CID, the encryption metadata, and the transaction hash.
 */
export async function encryptUploadAndSubmitProof(file: File, jobId: number, signer: ethers.Signer) {
  try {
    // 0. Fetch client address from the contract to set access control
    const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
    console.log(`Fetching details for Job ID: ${jobId}...`);
    const job = await escrowContract.jobs(jobId);
    const clientAddress = job.client;
    console.log(`Client for this job is: ${clientAddress}`);

    // 1. Encrypt the file with Lit Protocol
    console.log("Encrypting file for client...");
    const { ciphertext, metadata } = await encryptForClient(file, clientAddress);
    console.log("File encrypted.");

    // The ciphertext is a Blob. We create a File object for Storacha
    const encryptedFile = new File([ciphertext], `${file.name}.encrypted`, { type: 'application/octet-stream' });

    // 2. Initialize Storacha client
    const storageClient = await create();
    
    // 3. Upload encrypted file to Storacha
    console.log("Uploading encrypted file to Storacha...");
    const link = await storageClient.uploadFile(encryptedFile);
    const cid = link.toString();
    console.log("Encrypted file uploaded. CID:", cid);

    // 4. Attach CID to the milestone in ProofPayEscrow
    console.log(`Submitting proof for Job ID: ${jobId}...`);
    const tx = await escrowContract.submitProof(jobId, cid);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    return {
      cid,
      encryptionMetadata: metadata,
      txHash: tx.hash,
      receipt,
    };
  } catch (error) {
    console.error("Error in encryptUploadAndSubmitProof:", error);
    throw error;
  }
}
