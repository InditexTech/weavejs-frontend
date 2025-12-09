// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

let storage: PostgresStore | null = null;
let memory: Memory | null = null;

export const getStorage = (): PostgresStore => {
  if (!storage) {
    storage = new PostgresStore({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return storage;
};

export const getMemory = (): Memory => {
  if (!memory) {
    memory = new Memory({
      storage: new PostgresStore({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  return memory;
};
