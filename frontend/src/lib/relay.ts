/**
 * relayTransaction — sends a transaction via the gas-sponsoring relayer.
 *
 * Instead of calling writeContract directly from the browser (which requires
 * the user to hold FLOW for gas), this helper POSTs the intent to the relayer
 * backend. The relayer wallet submits the on-chain transaction and pays gas.
 *
 * Enabled by setting NEXT_PUBLIC_USE_RELAY=true in frontend/.env.local and
 * running the /server/relayer.js backend.
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
 * @param userAddress   EOA of the user authorising this action (used for
 *                      signature verification in later steps)
 * @returns             Transaction hash returned by the relayer
 */
export async function relayTransaction(
  functionName: RelayableFn,
  args: unknown[],
  userAddress: string
): Promise<`0x${string}`> {
  // BigInt is not JSON-serialisable; convert to decimal string
  const serialisedArgs = args.map((a) =>
    typeof a === "bigint" ? a.toString() : a
  );

  const response = await fetch(`${RELAYER_URL}/relay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ functionName, args: serialisedArgs, userAddress }),
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
