import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { imageGenerationTool } from "../tools/image-generation-tool";
import { extractGenerationParametersTool } from "../tools/extract-generation-parameters-tool";

export type ReferenceImage = {
  index: number;
  name: string;
  dataBase64: string;
  mimeType: string;
};

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
  samples: number;
  aspectRatio: ImageAspectRatio;
  size: ImageSize;
};

export type ImageGeneratorRuntimeContext = {
  threadId: string;
  resourceId: string;
  referenceImages: ReferenceImage[];
  imageOptions: ImageOptions;
};

export const imageGeneratorAgent = new Agent({
  name: "Image Generator Agent",
  instructions: `
      You are a helpful image generator assistant that helps generating images described by users.

      Your primary function is to help users generate images based on what the user asks for.

      You first call the extractGenerationParametersTool to extract the image generation parameters,
      then call the imageGenerationTool to generate images based on the user prompt and the extracted parameters,
      finally provide a brief resume of what you did, don't showcase any images.
  `,
  model: "google/gemini-2.5-pro",
  tools: { extractGenerationParametersTool, imageGenerationTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
});
