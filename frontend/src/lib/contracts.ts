import ProofPayEscrowABI from "./ProofPayEscrow.json";
import ProofPayRegistryABI from "./ProofPayRegistry.json";

export const CONFIG = {
  ESCROW_ADDRESS: "0xdFB2Dcb29dfDBD31b78f7f2f97046Ab1DAcecDA7" as `0x${string}`,
  REGISTRY_ADDRESS: "0xA9Eaf8E76966b60e9aB63C74a42605E84adF9EcE" as `0x${string}`,
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
