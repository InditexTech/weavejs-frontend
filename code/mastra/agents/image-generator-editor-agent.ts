import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { imageGenerationTool } from "../tools/image-generation-tool";

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
  imageSize: ImageSize;
};

export type ImageGeneratorRuntimeContext = {
  roomId: string;
  threadId: string;
  resourceId: string;
  referenceImages: ReferenceImage[];
  imageOptions: ImageOptions;
};

export const imageGeneratorEditorAgent = new Agent({
  name: "Image Generator / Editor Agent",
  instructions: `
      You are a helpful assistant that can:
      
      - Help users generate images based on the user prompt.
      - Help users edit images based on the user prompt.

      Call the imageGeneratorEditorAgent to generate or edit the image, use the user prompt
      without any changes, without changes, finally provide a brief resume of what you did,
      don't showcase any images.
  `,
  model: "google/gemini-2.5-pro",
  tools: {
    imageGenerationTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
});
