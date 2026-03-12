import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";

/**
 * Encrypts a file such that only the specified client address can decrypt it.
 * 
 * @param file The file to encrypt.
 * @param clientAddress The Ethereum address of the client who can decrypt.
 * @returns The encrypted file (blob) and the metadata required for decryption.
 */
export async function encryptForClient(file: File, clientAddress: string) {
  // 1. Initialize LitNodeClient
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: LitNetwork.DatilTestnet,
    debug: false,
  });
  await litNodeClient.connect();

  // 2. Define Access Control Conditions
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: clientAddress,
      },
    },
  ];

  // 3. Encrypt the file
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptFile(
    {
      file,
      accessControlConditions,
    },
    litNodeClient
  );

  return {
    ciphertext,
    metadata: {
      accessControlConditions,
      dataToEncryptHash,
    },
  };
}

/**
 * Decrypts a file previously encrypted for a client.
 */
export async function decryptForClient(ciphertext: string, dataToEncryptHash: string, accessControlConditions: any[]) {
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: LitNetwork.DatilTestnet,
    debug: false,
  });
  await litNodeClient.connect();

  const decryptedFileContents = await LitJsSdk.decryptToFile(
    {
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
      chain: "ethereum",
    },
    litNodeClient
  );

  return decryptedFileContents;
}
