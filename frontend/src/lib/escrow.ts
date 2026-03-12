import { create } from '@web3-storage/w3up-client';
import { ethers } from 'ethers';

// ProofPayEscrow ABI snippet for submitProof
const ESCROW_ABI = [
  "function submitProof(uint256 jobId, string calldata ipfsHash) external"
];

const ESCROW_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual deployed address

/**
 * Uploads a file to Storacha and attaches the CID to a milestone (job) in ProofPayEscrow.
 * 
 * @param file The file to upload.
 * @param jobId The ID of the job/milestone in the contract.
 * @param signer An ethers Signer to authorize the contract transaction.
 * @returns The CID and the transaction hash.
 */
export async function uploadAndSubmitProof(file: File, jobId: number, signer: ethers.Signer) {
  try {
    // 1. Initialize Storacha client
    // Note: In a real app, you'd handle agent/space authorization beforehand
    const client = await create();
    
    // 2. Upload file to Storacha
    console.log("Uploading file to Storacha...");
    const link = await client.uploadFile(file);
    const cid = link.toString();
    console.log("File uploaded. CID:", cid);

    // 3. Attach CID to the milestone in ProofPayEscrow
    console.log(`Submitting proof for Job ID: ${jobId}...`);
    const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
    
    const tx = await escrowContract.submitProof(jobId, cid);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    return {
      cid,
      txHash: tx.hash,
      receipt
    };
  } catch (error) {
    console.error("Error in uploadAndSubmitProof:", error);
    throw error;
  }
}

/**
 * Example usage in a component:
 * 
 * const handleUpload = async (file, jobId) => {
 *   const provider = new ethers.BrowserProvider(window.ethereum);
 *   const signer = await provider.getSigner();
 *   const result = await uploadAndSubmitProof(file, jobId, signer);
 *   alert(`Work submitted! CID: ${result.cid}`);
 * };
 */
