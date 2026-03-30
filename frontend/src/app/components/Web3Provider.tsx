"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { custom, fallback } from "viem";

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

// Use MetaMask's injected provider for Flow EVM reads to bypass CORS.
// Falls back to the HTTP RPC when no injected provider is available (SSR / non-browser).
const flowTransport =
  typeof window !== "undefined" && (window as any).ethereum
    ? fallback([
        custom((window as any).ethereum),
        http("https://testnet.evm.nodes.onflow.org"),
      ])
    : http("https://testnet.evm.nodes.onflow.org");

export const config = createConfig({
  chains: [flowEVMTestnet, mainnet, sepolia],
  transports: {
    [flowEVMTestnet.id]: flowTransport,
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
