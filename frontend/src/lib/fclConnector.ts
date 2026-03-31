"use client";

import * as fcl from "@onflow/fcl";
import { createConnector, ProviderNotFoundError } from "@wagmi/core";
import { getAddress } from "viem";
import type { Address } from "viem";

fclConnector.type = "fcl" as const;

/**
 * Wagmi v3 connector wrapping @onflow/fcl-ethereum-provider.
 * Users can connect with any Flow-native wallet (Blocto, etc.) via FCL
 * discovery while the rest of the app stays on standard wagmi/viem.
 */
export function fclConnector() {
  // Singleton EIP-1193 provider (browser-only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let provider: any;

  // Bound listeners so we can remove them cleanly
  let accountsChanged: ((accounts: string[]) => void) | undefined;
  let chainChanged: ((chainId: string) => void) | undefined;
  let disconnectHandler: (() => void) | undefined;

  return createConnector((config) => ({
    id: "flow-fcl",
    name: "Flow Wallet",
    type: fclConnector.type,

    async setup() {
      await this.getProvider();
    },

    async connect<withCapabilities extends boolean = false>(
      parameters?: {
        chainId?: number;
        isReconnecting?: boolean;
        withCapabilities?: withCapabilities | boolean;
      }
    ): Promise<{
      accounts: withCapabilities extends true
        ? readonly { address: Address; capabilities: Record<string, unknown> }[]
        : readonly Address[];
      chainId: number;
    }> {
      const p = await this.getProvider();
      if (!p) throw new ProviderNotFoundError();

      const requested: string[] = await p.request({
        method: "eth_requestAccounts",
      });
      const accounts = requested.map((x) => getAddress(x));

      if (!accountsChanged) {
        accountsChanged = this.onAccountsChanged.bind(this);
        p.on("accountsChanged", accountsChanged);
      }
      if (!chainChanged) {
        chainChanged = this.onChainChanged.bind(this);
        p.on("chainChanged", chainChanged);
      }
      if (!disconnectHandler) {
        disconnectHandler = this.onDisconnect.bind(this);
        p.on("disconnect", disconnectHandler);
      }

      const chainId = await this.getChainId();
      const { withCapabilities: wc } = parameters ?? {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = wc
        ? accounts.map((address) => ({
            address,
            capabilities: {} as Record<string, unknown>,
          }))
        : accounts;

      return { accounts: result, chainId };
    },

    async disconnect() {
      const p = await this.getProvider();
      if (!p) throw new ProviderNotFoundError();

      if (accountsChanged) {
        p.removeListener("accountsChanged", accountsChanged);
        accountsChanged = undefined;
      }
      if (chainChanged) {
        p.removeListener("chainChanged", chainChanged);
        chainChanged = undefined;
      }
      if (disconnectHandler) {
        p.removeListener("disconnect", disconnectHandler);
        disconnectHandler = undefined;
      }

      // FCL unauthenticate
      await p.disconnect();
    },

    async getAccounts(): Promise<readonly Address[]> {
      const p = await this.getProvider();
      if (!p) throw new ProviderNotFoundError();
      const accounts: string[] = await p.request({ method: "eth_accounts" });
      return accounts.map((x) => getAddress(x));
    },

    async getChainId(): Promise<number> {
      const p = await this.getProvider();
      if (!p) throw new ProviderNotFoundError();
      const hex: string = await p.request({ method: "eth_chainId" });
      return Number(hex);
    },

    async getProvider(): Promise<any> {
      if (typeof window === "undefined") return undefined;
      if (!provider) {
        // Dynamic import keeps this out of the SSR bundle
        const { createProvider } = await import(
          "@onflow/fcl-ethereum-provider"
        );
        provider = createProvider({
          config: fcl.config,
          user: fcl.currentUser,
        });
      }
      return provider;
    },

    async isAuthorized(): Promise<boolean> {
      try {
        const p = await this.getProvider();
        if (!p) return false;
        const accounts: string[] = await p.request({ method: "eth_accounts" });
        return accounts.length > 0;
      } catch {
        return false;
      }
    },

    async onAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) {
        config.emitter.emit("disconnect");
      } else if (config.emitter.listenerCount("connect")) {
        const chainId = (await this.getChainId()).toString();
        this.onConnect({ chainId });
      } else {
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x)),
        });
      }
    },

    onChainChanged(chain: string) {
      config.emitter.emit("change", { chainId: Number(chain) });
    },

    async onConnect(connectInfo: { chainId: string }) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0) return;
      config.emitter.emit("connect", {
        accounts: accounts as readonly Address[],
        chainId: Number(connectInfo.chainId),
      });
    },

    async onDisconnect() {
      config.emitter.emit("disconnect");
    },
  }));
}
