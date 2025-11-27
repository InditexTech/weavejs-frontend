"use client";

import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import React from "react";

type ChatBotPromptProviderProps = {
  children: React.ReactNode;
};

const ChatBotPromptProvider = ({ children }: ChatBotPromptProviderProps) => {
  return <PromptInputProvider>{children}</PromptInputProvider>;
};

export default ChatBotPromptProvider;
