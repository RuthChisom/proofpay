import * as fcl from "@onflow/fcl";

fcl.config()
  .put("app.detail.title", "ProofPay")
  .put("app.detail.icon", "https://proofpay.xyz/icon.png")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("flow.network", "testnet")
  // Standard discovery service that supports both browser extensions and embedded/walletless providers
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/testnet/authn")
  // Include specific embedded wallet providers (e.g., Blocto)
  .put("discovery.authn.include", ["0x82ec28371138a430"])
  // Open the wallet picker as an inline iframe (default, but explicit)
  .put("discovery.wallet.method", "IFRAME/RPC")
  .put("fcl.limit", 9999)
  // Required to avoid WalletConnect errors even if not used directly
  .put("walletconnect.projectId", "732e67f70624128527a20c32ba49f29d");
