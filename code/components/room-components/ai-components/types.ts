export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  chatId: string;
  messageId: string;
  role: ChatRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  part: any;
};
