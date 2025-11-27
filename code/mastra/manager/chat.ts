import { existsSync, mkdirSync } from "fs";
import { writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import fg from "fast-glob";

export type ChatMetadata = {
  threadId: string;
  resourceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type ChatData = {
  metadata: ChatMetadata;
  messages: any[];
};

export async function getChats(resourceId: string): Promise<ChatMetadata[]> {
  const chatDir = path.join(process.cwd(), "_chats", resourceId);
  if (!existsSync(chatDir)) {
    return Promise.resolve([]);
  }

  const files = await fg(path.join(chatDir, "*_metadata.json"));
  const readFiles = files.map((filePath) => {
    return readFile(filePath, "utf8").then(
      (data) => JSON.parse(data) as ChatMetadata
    );
  });

  return await Promise.all(readFiles);
}

export async function createChat(
  threadId: string,
  resourceId: string,
  metadata: ChatMetadata
) {
  if (await existsChat(threadId, resourceId)) {
    throw new Error(`Chat with id ${threadId} already exists.`);
  }

  await writeFile(getChatMessagesFile(threadId, resourceId), "[]"); // create an empty chat file
  await writeFile(
    getChatMetadataFile(threadId, resourceId),
    JSON.stringify(metadata, null, 2)
  );
}

export async function loadChatMetadata(
  threadId: string,
  resourceId: string
): Promise<ChatMetadata> {
  if (!existsChat(threadId, resourceId)) {
    throw new Error(`Chat with id ${threadId} not found.`);
  }

  const metadata: ChatMetadata = JSON.parse(
    await readFile(getChatMetadataFile(threadId, resourceId), "utf8")
  );

  return metadata;
}

export async function loadChat(
  threadId: string,
  resourceId: string
): Promise<ChatData> {
  if (!(await existsChat(threadId, resourceId))) {
    await createChat(threadId, resourceId, {
      threadId,
      resourceId,
      title: "Untitled chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const messages: any[] = JSON.parse(
    await readFile(getChatMessagesFile(threadId, resourceId), "utf8")
  );
  const metadata: ChatMetadata = JSON.parse(
    await readFile(getChatMetadataFile(threadId, resourceId), "utf8")
  );

  return {
    metadata,
    messages,
  };
}

export async function deleteChat(
  threadId: string,
  resourceId: string
): Promise<boolean> {
  if (!(await existsChat(threadId, resourceId))) {
    throw new Error(`Chat with id ${threadId} not found.`);
  }

  try {
    const chatMessages = getChatMessagesFile(threadId, resourceId);
    const chatMetadata = getChatMetadataFile(threadId, resourceId);

    await unlink(chatMessages);
    await unlink(chatMetadata);

    return true;
  } catch (ex) {
    console.error("Error deleting chat:", ex);
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveChat(
  threadId: string,
  resourceId: string,
  messages: any
) {
  if (!existsChat(threadId, resourceId)) {
    throw new Error(`Chat with id ${threadId} not found.`);
  }

  const actualChatMetadata = await loadChatMetadata(threadId, resourceId);

  const messagesFile = JSON.stringify(messages, null, 2);
  await writeFile(getChatMessagesFile(threadId, resourceId), messagesFile);
  const metadataFile = JSON.stringify(
    {
      ...actualChatMetadata,
      updatedAt: new Date().toISOString(),
    },
    null,
    2
  );
  await writeFile(getChatMetadataFile(threadId, resourceId), metadataFile);
}

async function existsChat(threadId: string, resourceId: string) {
  try {
    const chatMetadataPath = getChatMetadataFile(threadId, resourceId);
    await readFile(chatMetadataPath);
    return true;
  } catch {
    return false;
  }
}

function getChatMessagesFile(threadId: string, resourceId: string) {
  const chatDir = path.join(process.cwd(), "_chats", resourceId);
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return path.join(chatDir, `${threadId}_messages.json`);
}

function getChatMetadataFile(threadId: string, resourceId: string) {
  const chatDir = path.join(process.cwd(), "_chats", resourceId);
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return path.join(chatDir, `${threadId}_metadata.json`);
}
