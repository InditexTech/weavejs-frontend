// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatRequestOptions, ChatStatus } from "ai";
import { create } from "zustand";

export type ImageSize = "1K" | "2K" | "4K";

export type ImageAspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "9:16"
  | "16:9"
  | "21:9";

export type ImageOptions = {
  aspectRatio: ImageAspectRatio;
  size: ImageSize;
};

interface IAChatState {
  enabled: boolean;
  setup: {
    state: "idle" | "validating";
    visible: boolean;
  };
  status: ChatStatus | undefined;
  defined: boolean;
  threadId: string;
  resourceId: string;
  loaded: boolean;
  view: "chat" | "chats";
  imageOptions: ImageOptions;
  sendMessage:
    | ((
        message: PromptInputMessage,
        options?: ChatRequestOptions
      ) => Promise<void>)
    | null;
  setEnabled: (newEnabled: boolean) => void;
  setStatus: (newStatus: ChatStatus) => void;
  setDefined: (newDefined: boolean) => void;
  setThreadId: (newThreadId: string) => void;
  setResourceId: (newResourceId: string) => void;
  setLoaded: (newLoaded: boolean) => void;
  setView: (newView: "chat" | "chats") => void;
  setSendMessage: (
    newSendMessage: (
      message: PromptInputMessage,
      options?: ChatRequestOptions
    ) => Promise<void>
  ) => void;
  setImageSize: (newSize: ImageSize) => void;
  setImageAspectRatio: (newAspectRatio: ImageAspectRatio) => void;
  setSetupState: (newState: "idle" | "validating") => void;
  setSetupVisible: (newVisible: boolean) => void;
}

export const useIAChat = create<IAChatState>()((set) => ({
  enabled: sessionStorage.getItem("weave_ai_chat_enabled") === "true",
  setup: {
    state: "idle",
    visible: false,
  },
  status: undefined,
  sendMessage: null,
  defined: false,
  threadId: "undefined",
  resourceId: "undefined",
  metadata: undefined,
  loaded: false,
  view: "chat",
  imageOptions: {
    aspectRatio: "1:1",
    size: "1K",
  },
  setEnabled: (newEnabled) =>
    set((state) => ({
      ...state,
      enabled: newEnabled,
    })),
  setStatus: (newStatus) =>
    set((state) => ({
      ...state,
      status: newStatus,
    })),
  setDefined: (newDefined) =>
    set((state) => ({
      ...state,
      defined: newDefined,
    })),
  setThreadId: (newThreadId) =>
    set((state) => ({
      ...state,
      threadId: newThreadId,
    })),
  setResourceId: (newResourceId) =>
    set((state) => ({
      ...state,
      resourceId: newResourceId,
    })),
  setLoaded: (newLoaded) =>
    set((state) => ({
      ...state,
      loaded: newLoaded,
    })),
  setView: (newView) =>
    set((state) => ({
      ...state,
      view: newView,
    })),
  setSendMessage: (newSendMessage) =>
    set((state) => ({
      ...state,
      sendMessage: newSendMessage,
    })),
  setImageSize: (newSize) =>
    set((state) => ({
      ...state,
      imageOptions: { ...state.imageOptions, size: newSize },
    })),
  setImageAspectRatio: (newAspectRatio) =>
    set((state) => ({
      ...state,
      imageOptions: { ...state.imageOptions, aspectRatio: newAspectRatio },
    })),
  setSetupState: (newState) =>
    set((state) => ({
      ...state,
      setup: { ...state.setup, state: newState },
    })),
  setSetupVisible: (newVisible) =>
    set((state) => ({
      ...state,
      setup: { ...state.setup, visible: newVisible },
    })),
}));
