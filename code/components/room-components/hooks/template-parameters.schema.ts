// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

const imageParameterSchema = z.object({
  nodeId: z.string(),
  kind: z.literal("image"),
  properties: z.object({
    image: z.object({
      source: z.string(),
      width: z.number(),
      height: z.number(),
    }),
    fit: z.enum(["cover", "contain"]),
  }),
});

const textParameterSchema = z.object({
  nodeId: z.string(),
  kind: z.literal("text"),
  // All known text style fields are declared explicitly; extra keys are preserved via passthrough.
  properties: z
    .object({
      text: z.string(),
      fontFamily: z.string().optional(),
      fontSize: z.number().optional(),
      align: z.string().optional(),
      verticalAlign: z.string().optional(),
      fill: z.string().optional(),
      layout: z.string().optional(),
    })
    .passthrough(),
});

export const templateParameterEntrySchema = z.discriminatedUnion("kind", [
  imageParameterSchema,
  textParameterSchema,
]);

export const templateParametersSchema = z.record(
  z.string(),
  templateParameterEntrySchema,
);

export type TemplateParameterEntry = z.infer<typeof templateParameterEntrySchema>;
export type TemplateParameters = z.infer<typeof templateParametersSchema>;
