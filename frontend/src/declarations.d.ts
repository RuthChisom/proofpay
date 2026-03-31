// These packages ship CJS without declaration files.
// Declare them as `any` to satisfy TypeScript strict mode.
declare module "@onflow/fcl" {
  const fcl: any;
  export = fcl;
}
declare module "@onflow/fcl-ethereum-provider" {
  export function createProvider(config: {
    config: any;
    user: any;
    rpcUrls?: Record<number, string>;
    service?: any;
  }): any;
  export class WalletConnectEthereumProvider {}
}
