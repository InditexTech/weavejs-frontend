// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type ImageModel =
  | "openai/gpt-image-1"
  | "gemini/gemini-2.5-flash-image-preview";
export type ImageQuality = "low" | "medium" | "high";
export type ImageModeration = "low" | "auto";
export type ImageSampleCount = number;
export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024" | "auto";
