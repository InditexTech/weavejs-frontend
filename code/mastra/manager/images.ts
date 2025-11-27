// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export class ImagesPersistenceHandler {
  private _blobServiceClient!: BlobServiceClient;
  private _containerClient!: ContainerClient;
  private _initialized!: boolean;

  constructor() {
    this._initialized = false;
  }

  isInitialized() {
    return this._initialized;
  }

  async setup() {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const storageAccountUrl = `https://${accountName}.blob.core.windows.net`;

    this._blobServiceClient = new BlobServiceClient(
      storageAccountUrl,
      credential
    );

    this._containerClient =
      this._blobServiceClient.getContainerClient(containerName);
    if (!(await this._containerClient.exists())) {
      this._containerClient = (
        await this._blobServiceClient.createContainer(containerName)
      ).containerClient;
    }

    this._initialized = true;
  }

  async exists(imageName: string) {
    try {
      if (!this._initialized) {
        await this.setup();
      }

      const blockBlobClient =
        this._containerClient.getBlockBlobClient(imageName);
      return await blockBlobClient.exists();
    } catch (ex) {
      console.error("Error checking if image exists", ex);
      return false;
    }
  }

  async persist(
    imageName: string,
    { mimeType, size }: { mimeType: string; size: number },
    content: Uint8Array
  ): Promise<boolean> {
    try {
      if (!this._initialized) {
        await this.setup();
      }

      const blockBlobClient =
        this._containerClient.getBlockBlobClient(imageName);
      const uploadBlobResponse = await blockBlobClient.uploadData(content, {
        blockSize: size,
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
      });

      return !uploadBlobResponse.errorCode;
    } catch (ex) {
      console.error("Error persisting image", ex);
      return false;
    }
  }
}
