import { create } from "@web3-storage/w3up-client";

const STORACHA_EMAIL = process.env.NEXT_PUBLIC_STORACHA_EMAIL;
const STORACHA_SPACE = process.env.NEXT_PUBLIC_STORACHA_SPACE || "proofpay";

let readyClient: Promise<any> | null = null;

async function getStorachaClient() {
  if (!STORACHA_EMAIL) {
    throw new Error("Missing NEXT_PUBLIC_STORACHA_EMAIL. Add it to frontend/.env.local.");
  }

  if (!readyClient) {
    readyClient = (async () => {
      const client: any = await create();
      const account = await client.login(STORACHA_EMAIL);
      await account.plan.wait();

      const currentSpace = client.currentSpace?.();
      if (!currentSpace) {
        const createdSpace = await client.createSpace(STORACHA_SPACE, { account });
        await client.setCurrentSpace(createdSpace.did());
      }

      return client;
    })();
  }

  return readyClient;
}

export async function uploadFile(file: File): Promise<string> {
  const storageClient = await getStorachaClient();
  const uploaded = await storageClient.uploadFile(file);
  return uploaded.toString();
}

export async function uploadJSON(data: any): Promise<string> {
  const storageClient = await getStorachaClient();
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const file = new File([blob], "metadata.json", { type: "application/json" });
  const uploaded = await storageClient.uploadFile(file);
  return uploaded.toString();
}
