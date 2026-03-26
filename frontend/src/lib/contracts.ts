import ProofPayEscrowABI from "./ProofPayEscrow.json";
import ProofPayRegistryABI from "./ProofPayRegistry.json";

export const CONFIG = {
  ESCROW_ADDRESS: "0x7D674fDE6F3c7ba7583abeCAa5Ce43F15F618B8f" as `0x${string}`,
  REGISTRY_ADDRESS: "0x8E447A61AA900A586124B823248a8C705b252F3a" as `0x${string}`,
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
