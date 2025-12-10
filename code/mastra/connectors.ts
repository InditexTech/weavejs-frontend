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
    const host = process.env.DATABASE_HOST ?? "";
    const port = Number(process.env.DATABASE_PORT ?? "5432");
    const database = process.env.DATABASE_NAME ?? "";
    const user = process.env.DATABASE_USERNAME ?? "";
    const useSsl = process.env.DATABASE_SSL === "true";

    let password: string = process.env.DATABASE_PASSWORD ?? "";
    if (process.env.DATABASE_CLOUD_CREDENTIALS === "true") {
      password = ((await getDatabaseCloudCredentialsToken()) as AccessToken)
        .token;
    }
    console.log("Initializing PostgresStore with parameters:");
    console.log(`- host: ${host}`);
    console.log(`- port: ${host}`);
    console.log(`- database: ${database}`);
    console.log(`- user: ${user}`);
    // console.log(`- password: ${password}`);
    console.log(`- use SSL: ${useSsl}`);

    storage = new PostgresStore({
      host,
      port,
      database,
      user,
      password,
      ssl: useSsl,
    });
  }

  return storage;
};

export const getMemory = async (): Promise<Memory> => {
  if (!memory) {
    const host = process.env.DATABASE_HOST ?? "";
    const port = Number(process.env.DATABASE_PORT ?? "5432");
    const database = process.env.DATABASE_NAME ?? "";
    const user = process.env.DATABASE_USERNAME ?? "";
    const useSsl = process.env.DATABASE_SSL === "true";

    let password: string = process.env.DATABASE_PASSWORD ?? "";
    if (process.env.DATABASE_CLOUD_CREDENTIALS === "true") {
      password = ((await getDatabaseCloudCredentialsToken()) as AccessToken)
        .token;
    }
    console.log("Initializing PostgresStore with parameters:");
    console.log(`- host: ${host}`);
    console.log(`- port: ${host}`);
    console.log(`- database: ${database}`);
    console.log(`- user: ${user}`);
    // console.log(`- password: ${password}`);
    console.log(`- use SSL: ${useSsl}`);

    memory = new Memory({
      storage: new PostgresStore({
        host,
        port,
        database,
        user,
        password,
        ssl: useSsl,
      }),
    });
  }

  return memory;
};
