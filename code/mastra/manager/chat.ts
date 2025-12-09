// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { postChat } from "@/api/post-chat";
import { delChat } from "@/api/del-chat";
import { getChat } from "@/api/get-chat";
import { getChats as getApiChats } from "@/api/get-chats";
import { postChatMessages } from "@/api/post-chat-messages";
import { putChat } from "@/api/put-chat";

export type ChatStatus = "active" | "deleted";

export type Chat = {
  roomId: string;
  chatId: string;
  resourceId: string;
  status: ChatStatus;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  chatId: string;
  messageId: string;
  role: ChatRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  part: any;
};

type ChatData = {
  metadata: Chat;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: ChatMessage[];
};

export async function getChats(
  roomId: string,
  resourceId: string,
  limit = 50,
  offset = 0
): Promise<{ chats: Chat[]; total: number }> {
  try {
    const chats = await getApiChats(roomId, resourceId, limit, offset);
    return chats || { chats: [], total: 0 };
  } catch (ex) {
    console.error("Error fetching chats.", ex);
    return { chats: [], total: 0 };
  }
}

export async function createChat(
  roomId: string,
  chatId: string,
  resourceId: string,
  data: Partial<Chat>
) {
  try {
    return await postChat(roomId, chatId, resourceId, {
      status: "active",
      title: data.title ?? "Untitled chat",
    });
  } catch (ex) {
    console.error("Error creating chat.", ex);
    return null;
  }
}

export async function loadChat(
  roomId: string,
  chatId: string,
  resourceId: string
): Promise<ChatData> {
  let chat = null;

  try {
    chat = await getChat(roomId, chatId, resourceId);

    if (!chat) {
      const newChat = await createChat(roomId, chatId, resourceId, {
        title: "Untitled chat",
        status: "active",
      });
      chat = newChat;
    }
  } catch (ex) {
    console.error("Error fetching chat / creating new.", ex);
  }

  if (!chat) {
    throw new Error(`Chat with id ${chatId} not found.`);
  }

  return chat;
}

export async function deleteChat(
  roomId: string,
  chatId: string,
  resourceId: string
): Promise<boolean> {
  try {
    await delChat(roomId, chatId, resourceId);
    return true;
  } catch (ex) {
    console.error("Error deleting chat.", ex);
    return false;
  }
}

export async function saveChatMessages(
  roomId: string,
  chatId: string,
  resourceId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[]
) {
  try {
    await postChatMessages(roomId, chatId, resourceId, messages, false);
    await putChat(roomId, chatId, resourceId, {}, false);
  } catch (ex) {
    console.error("Error saving chat messages.", ex);
    throw ex;
  }
}
