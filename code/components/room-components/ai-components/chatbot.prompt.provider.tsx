// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import React from "react";

type ChatBotPromptProviderProps = {
  children: React.ReactNode;
};

const ChatBotPromptProvider = ({ children }: ChatBotPromptProviderProps) => {
  return <PromptInputProvider>{children}</PromptInputProvider>;
};

export default ChatBotPromptProvider;
