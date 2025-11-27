import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ImageOptions } from "../agents/image-generator-agent";

export const extractGenerationParametersTool = createTool({
  id: "extract-generation-parameters",
  description: "Extract the user defined parameters to generate an image",
  inputSchema: z.object({
    prompt: z.string().describe("What the user parameters wants"),
  }),
  outputSchema: z.object({
    imageGenerationParameters: z.object({
      samples: z.number(),
      aspectRatio: z.string(),
      size: z.string(),
    }),
  }),
  execute: async ({ runtimeContext }) => {
    const imageOptions = runtimeContext.get("imageOptions") as ImageOptions;

    return {
      imageGenerationParameters: imageOptions,
    };
  },
});
