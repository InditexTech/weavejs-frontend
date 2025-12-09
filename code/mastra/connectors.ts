// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";
import { AccessToken, DefaultAzureCredential } from "@azure/identity";

let storage: PostgresStore | null = null;
let memory: Memory | null = null;

export async function getDatabaseCloudCredentialsToken(): Promise<AccessToken> {
  const credential = new DefaultAzureCredential();
  const scope = "https://ossrdbms-aad.database.windows.net/.default";
  const token = await credential.getToken(scope, {});
  return token;
}

export const getStorage = async (): Promise<PostgresStore> => {
  if (!storage) {
    let password: string = process.env.DATABASE_PASSWORD ?? "";
    if (process.env.DATABASE_CLOUD_CREDENTIALS === "true") {
      password =
        (await getDatabaseCloudCredentialsToken()) as unknown as string;
    }

    storage = new PostgresStore({
      host: process.env.DATABASE_HOST ?? "",
      port: Number(process.env.DATABASE_PORT ?? "5432"),
      database: process.env.DATABASE_NAME ?? "",
      user: process.env.DATABASE_USERNAME ?? "",
      password,
      ssl: process.env.DATABASE_SSL === "true",
    });
  }

  return storage;
};

export const getMemory = async (): Promise<Memory> => {
  if (!memory) {
    let password: string = process.env.DATABASE_PASSWORD ?? "";
    if (process.env.DATABASE_CLOUD_CREDENTIALS === "true") {
      password =
        (await getDatabaseCloudCredentialsToken()) as unknown as string;
    }

    memory = new Memory({
      storage: new PostgresStore({
        host: process.env.DATABASE_HOST ?? "",
        port: Number(process.env.DATABASE_PORT ?? "5432"),
        database: process.env.DATABASE_NAME ?? "",
        user: process.env.DATABASE_USERNAME ?? "",
        password,
        ssl: process.env.DATABASE_SSL === "true",
      }),
    });
  }

  return memory;
};
