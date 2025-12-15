// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  chatId: string;
  messageId: string;
  role: ChatRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  part: any;
};
