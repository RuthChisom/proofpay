/**
 * Relay a contract write through the backend gas sponsor.
 *
 * Flow:
 *  1. Ask the user to sign a fixed authorization message (no tx sent to wallet).
 *  2. POST the intent to /relay so the backend can submit the transaction
 *     on-chain with sponsored gas.
 */

export type RelayTransactionParams = {
  functionName: string;
  args: readonly unknown[];
  value?: bigint;
  userAddress: `0x${string}`;
  signMessage: (message: string) => Promise<`0x${string}`>;
};

export type RelayTransactionResult = {
  txHash: `0x${string}`;
};

/** Recursively serialize args so bigint values survive JSON.stringify. */
function serializeArgs(args: readonly unknown[]): unknown[] {
  return args.map((arg) => {
    if (typeof arg === "bigint") return arg.toString();
    if (Array.isArray(arg)) return serializeArgs(arg);
    return arg;
  });
}

export async function relayTransaction({
  functionName,
  args,
  value,
  userAddress,
  signMessage,
}: RelayTransactionParams): Promise<RelayTransactionResult> {
  const signature = await signMessage("Authorize ProofPay transaction");

  const body: Record<string, unknown> = {
    functionName,
    args: serializeArgs(args),
    userAddress,
    signature,
  };

  if (value !== undefined) {
    body.value = value.toString();
  }

  const response = await fetch("/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Relay request failed (HTTP ${response.status}).`);
  }

  return response.json() as Promise<RelayTransactionResult>;
}
