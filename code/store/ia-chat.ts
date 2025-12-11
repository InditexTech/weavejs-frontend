// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatRequestOptions, ChatStatus } from "ai";
import { create } from "zustand";

export type ImageSizeGemini = "1K" | "2K" | "4K";

export type ImageSizeChatGTP = "1024x1024" | "1024x1536" | "1536x1024";

export type ImageAspectRatioGemini =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "9:16"
  | "16:9"
  | "21:9";

export type ImageAspectRatioChatGTP = "1:1" | "1:5" | "5:1";

export type ImageQualityChatGTP = "low" | "medium" | "high";

export type AvailableImageModels =
  | "openai/gpt-image-1"
  | "gemini/gemini-3-pro-image-preview";

export type ImageOptions =
  | {
      model: "openai/gpt-image-1";
      samples: number;
      aspectRatio: ImageAspectRatioChatGTP;
      quality: ImageQualityChatGTP;
      size: ImageSizeChatGTP;
    }
  | {
      model: "gemini/gemini-3-pro-image-preview";
      samples: number;
      aspectRatio: ImageAspectRatioGemini;
      quality?: undefined;
      size: ImageSizeGemini;
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
  scrollToBottom: (() => void) | null;
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
  setScrollToBottom: (newScrollToBottom: () => void) => void;
  setSendMessage: (
    newSendMessage: (
      message: PromptInputMessage,
      options?: ChatRequestOptions
    ) => Promise<void>
  ) => void;
  setImageModel: (newModel: AvailableImageModels) => void;
  setImageSize: (newSize: unknown) => void;
  setImageQuality: (newQuality: unknown) => void;
  setImageSamples: (newSamples: number) => void;
  setImageAspectRatio: (newAspectRatio: unknown) => void;
  setSetupState: (newState: "idle" | "validating") => void;
  setSetupVisible: (newVisible: boolean) => void;
}

export const useIAChat = create<IAChatState>()((set) => {
  let aiEnabled: boolean = false;
  if (typeof sessionStorage !== "undefined") {
    aiEnabled = sessionStorage.getItem("weave_ai_chat_enabled") === "true";
  }

  return {
    enabled: aiEnabled,
    setup: {
      state: "idle",
      visible: false,
    },
    status: undefined,
    sendMessage: null,
    scrollToBottom: null,
    defined: false,
    threadId: "undefined",
    resourceId: "undefined",
    metadata: undefined,
    loaded: false,
    view: "chat",
    imageOptions: {
      model: "gemini/gemini-3-pro-image-preview",
      samples: 1,
      aspectRatio: "1:1",
      quality: undefined,
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
    setScrollToBottom: (newScrollToBottom) =>
      set((state) => ({
        ...state,
        scrollToBottom: newScrollToBottom,
      })),
    setSendMessage: (newSendMessage) =>
      set((state) => ({
        ...state,
        sendMessage: newSendMessage,
      })),
    setImageModel: (newModel) =>
      set((state) => {
        if (newModel === "openai/gpt-image-1") {
          return {
            ...state,
            imageOptions: {
              ...state.imageOptions,
              model: newModel,
              quality: "medium",
              size: "1024x1024",
              aspectRatio: "1:1",
              samples: 1,
            },
          };
        }

        return {
          ...state,
          imageOptions: {
            ...state.imageOptions,
            model: newModel,
            size: "1K",
            quality: undefined,
            aspectRatio: "1:1",
            samples: 1,
          },
        };
      }),
    setImageSamples: (newSamples) =>
      set((state) => ({
        ...state,
        imageOptions: { ...state.imageOptions, samples: newSamples },
      })),
    setImageQuality: (newQuality) =>
      set((state) => {
        if (state.imageOptions.model === "openai/gpt-image-1") {
          return {
            ...state,
            imageOptions: {
              ...state.imageOptions,
              quality: newQuality as ImageQualityChatGTP,
            },
          };
        }

        return state;
      }),
    setImageSize: (newSize) =>
      set((state) => {
        if (state.imageOptions.model === "openai/gpt-image-1") {
          return {
            ...state,
            imageOptions: {
              ...state.imageOptions,
              size: newSize as ImageSizeChatGTP,
            },
          };
        }

        return {
          ...state,
          imageOptions: {
            ...state.imageOptions,
            size: newSize as ImageSizeGemini,
          },
        };
      }),
    setImageAspectRatio: (newAspectRatio) =>
      set((state) => {
        if (state.imageOptions.model === "openai/gpt-image-1") {
          return {
            ...state,
            imageOptions: {
              ...state.imageOptions,
              aspectRatio: newAspectRatio as ImageAspectRatioChatGTP,
            },
          };
        }

        return {
          ...state,
          imageOptions: {
            ...state.imageOptions,
            aspectRatio: newAspectRatio as ImageAspectRatioGemini,
          },
        };
      }),
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
  };
});
