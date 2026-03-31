/**
 * relayTransaction — sends a transaction via the gas-sponsoring relayer.
 *
 * Instead of calling writeContract directly from the browser (which requires
 * the user to hold FLOW for gas), this helper POSTs the intent to the relayer
 * backend. The relayer wallet submits the on-chain transaction and pays gas.
 *
 * Requires the /server/relayer.js backend to be running. Configure
 * NEXT_PUBLIC_RELAYER_URL in frontend/.env.local if not on localhost:3001.
 */

const RELAYER_URL =
  process.env.NEXT_PUBLIC_RELAYER_URL ?? "http://localhost:3001";

export type RelayableFn =
  | "acceptJob"
  | "submitProof"
  | "releasePayment"
  | "claimPaymentIfClientInactive";

/**
 * @param functionName  Contract function to call (must be in RelayableFn)
 * @param args          Call arguments. BigInt values are serialised to decimal
 *                      strings automatically — the relayer reconstructs them.
 * @param userAddress   EOA of the user authorising this action
 * @param signature     EIP-191 signature of "Authorize ProofPay transaction"
 *                      produced by the user's wallet; verified server-side
 * @returns             Transaction hash returned by the relayer
 */
export async function relayTransaction(
  functionName: RelayableFn,
  args: unknown[],
  userAddress: string,
  signature: string
): Promise<`0x${string}`> {
  // BigInt is not JSON-serialisable; convert to decimal string
  const serialisedArgs = args.map((a) =>
    typeof a === "bigint" ? a.toString() : a
  );

  const response = await fetch(`${RELAYER_URL}/relay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ functionName, args: serialisedArgs, userAddress, signature }),
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ error: "Unknown error from relayer" }));
    throw new Error(body.error ?? "Relay request failed");
  }

  const { txHash } = await response.json();
  return txHash as `0x${string}`;
}
