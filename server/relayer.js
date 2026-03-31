/**
 * ProofPay Gas-Sponsoring Relayer
 *
 * Accepts signed intent payloads from the frontend, constructs the EVM
 * transaction, and broadcasts it using the relayer wallet so the user
 * does not need FLOW tokens for gas.
 *
 * ⚠️  IMPORTANT — msg.sender note
 * ─────────────────────────────────
 * ProofPay's contracts use msg.sender to identify the client / freelancer.
 * In this initial setup the RELAYER wallet is msg.sender, which means
 * the relayer address becomes the on-chain participant.
 *
 * Steps 4-7 will introduce EIP-712 user signatures so the frontend proves
 * authorisation before the relayer acts, and (optionally) the Flow Cadence
 * "EVM.run()" sponsored-transaction mechanism will be used to make the
 * USER the true msg.sender while the relayer pays the FLOW network fee.
 */

"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {
  createWalletClient,
  createPublicClient,
  http,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");

// ─── ABI ─────────────────────────────────────────────────────────────────────
const ProofPayEscrowABI = require("../frontend/src/lib/ProofPayEscrow.json");

// ─── Chain definition ────────────────────────────────────────────────────────
const flowEVMTestnet = {
  id: 545,
  name: "Flow EVM Testnet",
  nativeCurrency: { name: "FLOW", symbol: "FLOW", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.evm.nodes.onflow.org"] },
  },
};

// ─── Contract ────────────────────────────────────────────────────────────────
const ESCROW_ADDRESS =
  /** @type {`0x${string}`} */ (
    "0x32fb4173bb3f8f0dfbcd39c7a5ba8b0daf13ad24"
  );

// ─── Validate env ────────────────────────────────────────────────────────────
if (!process.env.RELAYER_PRIVATE_KEY) {
  console.error("[relayer] ❌  RELAYER_PRIVATE_KEY is not set. Exiting.");
  process.exit(1);
}

// ─── Relayer wallet ──────────────────────────────────────────────────────────
const account = privateKeyToAccount(
  /** @type {`0x${string}`} */ (process.env.RELAYER_PRIVATE_KEY)
);

const rpcUrl =
  process.env.FLOW_EVM_RPC || "https://testnet.evm.nodes.onflow.org";

const publicClient = createPublicClient({
  chain: flowEVMTestnet,
  transport: http(rpcUrl),
});

const walletClient = createWalletClient({
  account,
  chain: flowEVMTestnet,
  transport: http(rpcUrl),
});

// ─── Allowed relay-able functions ────────────────────────────────────────────
// createJob is intentionally excluded: it is payable (msg.value) and sets
// msg.sender as the job client. Relaying it would make the relayer the client.
const ALLOWED_FUNCTIONS = new Set([
  "acceptJob",
  "submitProof",
  "releasePayment",
  "claimPaymentIfClientInactive",
]);

// ─── Arg coercion ────────────────────────────────────────────────────────────
// JSON cannot represent BigInt. The frontend sends uint256 values as decimal
// strings; this function converts them back to BigInt before passing to viem.
function coerceArgs(functionName, rawArgs) {
  const fnAbi = ProofPayEscrowABI.find(
    (item) => item.type === "function" && item.name === functionName
  );
  if (!fnAbi) return rawArgs;

  return rawArgs.map((arg, i) => {
    const inputType = fnAbi.inputs[i]?.type ?? "";
    if (/^uint\d*$/.test(inputType) && typeof arg === "string") {
      return BigInt(arg);
    }
    return arg;
  });
}

// ─── Express app ─────────────────────────────────────────────────────────────
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ─── GET /health ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", relayerAddress: account.address });
});

// ─── POST /relay ──────────────────────────────────────────────────────────────
// Body:   { functionName: string, args: unknown[], userAddress: string }
// Returns: { txHash: `0x${string}` }
app.post("/relay", async (req, res) => {
  const { functionName, args, userAddress } = req.body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (
    typeof functionName !== "string" ||
    !Array.isArray(args) ||
    typeof userAddress !== "string"
  ) {
    return res.status(400).json({
      error:
        "Request body must include: functionName (string), args (array), userAddress (string)",
    });
  }

  if (!ALLOWED_FUNCTIONS.has(functionName)) {
    return res.status(400).json({
      error: `"${functionName}" is not relayable. Allowed: ${[
        ...ALLOWED_FUNCTIONS,
      ].join(", ")}`,
    });
  }

  // ── Coerce BigInt args ────────────────────────────────────────────────────
  const coercedArgs = coerceArgs(functionName, args);

  console.log(
    `[relay] ${functionName}(${JSON.stringify(args)}) requested by ${userAddress}`
  );

  try {
    // Simulate first to surface revert reasons without spending gas
    const { request } = await publicClient.simulateContract({
      account,
      address: ESCROW_ADDRESS,
      abi: ProofPayEscrowABI,
      functionName,
      args: coercedArgs,
    });

    // Add 20% buffer to the simulated gas estimate
    const gas =
      request.gas != null ? (request.gas * 12n) / 10n : undefined;

    const txHash = await walletClient.writeContract({ ...request, gas });

    console.log(`[relay] ✅  txHash=${txHash}`);
    return res.json({ txHash });
  } catch (err) {
    const message =
      err?.shortMessage ?? err?.message ?? "Transaction failed";
    console.error(`[relay] ❌  ${message}`);
    return res.status(500).json({ error: message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => {
  console.log(`[relayer] Server running on http://localhost:${PORT}`);
  console.log(`[relayer] Relayer wallet: ${account.address}`);
});
