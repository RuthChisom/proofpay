"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";
import { fclConnector } from "@/lib/fclConnector";
import "@/app/fcl-config"; // initialise FCL

// Define Flow EVM Testnet chain
const flowEVMTestnet = {
  id: 545,
  name: "Flow EVM Testnet",
  nativeCurrency: { name: "FLOW", symbol: "FLOW", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.evm.nodes.onflow.org"] },
  },
  blockExplorers: {
    default: { name: "FlowScan", url: "https://evm-testnet.flowscan.io" },
  },
} as const;

export const config = createConfig({
  chains: [flowEVMTestnet, mainnet, sepolia],
  connectors: [injected(), fclConnector()],
  transports: {
    [flowEVMTestnet.id]: http("https://testnet.evm.nodes.onflow.org"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
