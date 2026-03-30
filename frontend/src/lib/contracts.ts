import ProofPayEscrowABI from "./ProofPayEscrow.json";
import ProofPayRegistryABI from "./ProofPayRegistry.json";

export const CONFIG = {
  ESCROW_ADDRESS: "0x32fb4173bb3f8f0dfbcd39c7a5ba8b0daf13ad24" as `0x${string}`,
  REGISTRY_ADDRESS: "0xa57b95e94d45bf4d8a056a2b6ce71989d9739d6a" as `0x${string}`,
  FLOW_EVM_RPC: "https://testnet.evm.nodes.onflow.org",
  CHAIN_ID: 545,
};

export const ProofPayEscrow = {
  address: CONFIG.ESCROW_ADDRESS,
  abi: ProofPayEscrowABI,
};

export const ProofPayRegistry = {
  address: CONFIG.REGISTRY_ADDRESS,
  abi: ProofPayRegistryABI,
};
