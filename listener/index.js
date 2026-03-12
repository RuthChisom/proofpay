const { ethers } = require("ethers");
const OpenAI = require("openai");
require("dotenv").config();

// Contract ABI (simplified for events and job fetching)
const ESCROW_ABI = [
  "event ProofSubmitted(uint256 indexed jobId, string proofHash)",
  "function jobs(uint256) public view returns (address client, address freelancer, uint256 payment, string proofHash, bool accepted, bool completed)"
];

const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000";
const RPC_URL = process.env.RPC_URL || "https://rest-testnet.onflow.org/evm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function verifyWithAI(jobId, proofHash, payment) {
  try {
    // Placeholder for actual proof fetching (e.g., from IPFS/Storacha)
    const proofContent = "Mock content for CID: " + proofHash; 

    const prompt = `
      Verify the following freelance work submission for Job ID ${jobId}.
      Work Proof: ${proofContent}
      Payment Amount: ${ethers.formatEther(payment)} FLOW/ETH
      
      Tasks:
      1. Analyze the work proof (GitHub diff/design/code).
      2. Verify if it meets standard quality.
      3. Generate a human-readable recommendation for the client.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Verification failed:", error);
    return "AI verification unavailable at this time.";
  }
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

  console.log("Listening for ProofPayEscrow events on", ESCROW_ADDRESS);

  contract.on("ProofSubmitted", async (jobId, proofHash, event) => {
    console.log(`\nNew Proof Submitted! Job ID: ${jobId}, CID: ${proofHash}`);

    try {
      // 1. Fetch job details from the contract
      const job = await contract.jobs(jobId);
      const { client, freelancer, payment } = job;
      const formattedPayment = ethers.formatEther(payment);

      console.log(`Client: ${client}`);
      console.log(`Freelancer: ${freelancer}`);
      console.log(`Payment: ${formattedPayment}`);

      // 2. Generate Human-Readable Instructions
      const instruction = `Release ${formattedPayment} to Freelancer ${freelancer} for completing work submitted at CID: ${proofHash}.`;
      console.log("\nINSTRUCTION:");
      console.log(">>", instruction);

      // 3. Optional: AI Verification
      console.log("\nStarting AI Verification...");
      const aiVerdict = await verifyWithAI(jobId, proofHash, payment);
      console.log("AI VERDICT:");
      console.log(aiVerdict);

    } catch (error) {
      console.error("Error processing event:", error);
    }
  });

  // Keep script running
  process.on("SIGINT", () => {
    console.log("Listener stopped.");
    process.exit();
  });
}

main().catch(console.error);
