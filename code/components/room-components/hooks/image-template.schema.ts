// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

// Forward-declare the type so z.lazy can reference it recursively.
export type ImageTemplateNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: string;
  editable: boolean;
  optional?: boolean;
  children?: ImageTemplateNode[];
  defaultProperties?: Record<string, unknown>;
  [key: string]: unknown;
};

// Recursive node schema — z.lazy is required because a frame node embeds children
// of the same type. All objects use .passthrough() so unknown extra keys are preserved.
export const imageTemplateNodeSchema: z.ZodType<ImageTemplateNode> = z.lazy(
  () =>
    z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      kind: z.string(),
      editable: z.boolean(),
      optional: z.boolean().optional(),
      children: z.array(imageTemplateNodeSchema).optional(),
      defaultProperties: z.record(z.unknown()).optional(),
    }),
);

export const imageTemplateSchema = z.object({
  version: z.string(),
  name: z.string(),
  nodes: z.array(imageTemplateNodeSchema),
});

export type ImageTemplate = z.infer<typeof imageTemplateSchema>;
