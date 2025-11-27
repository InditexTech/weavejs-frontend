import { v4 as uuidv4 } from "uuid";
import { createTool } from "@mastra/core/tools";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { ImagesPersistenceHandler } from "../manager/images";
import {
  ImageAspectRatio,
  ImageGeneratorRuntimeContext,
  ImageOptions,
  ImageSize,
  ReferenceImage,
} from "../agents/image-generator-agent";

type GeneratedImage = {
  imageId: string;
  status: "generating" | "generated" | "failed";
  url?: string;
};

type ImageGenerationToolContext = ImageGeneratorRuntimeContext;

let imageHandler: ImagesPersistenceHandler | null = null;

export const initImageGenerationTool = async () => {
  imageHandler = new ImagesPersistenceHandler();
  await imageHandler.setup();
};

export const imageGenerationTool = createTool({
  id: "generate-image",
  description: "Generate an image based on a description",
  inputSchema: z.object({
    prompt: z.string().describe("What the user wants to see in the image"),
    samples: z.number(),
    aspectRatio: z.string(),
    size: z.string(),
  }),
  outputSchema: z.array(
    z.object({
      imageId: z.string(),
      status: z.enum(["generating", "generated", "failed"]),
      url: z.string().optional(),
    })
  ),
  execute: async ({ runtimeContext, context }) => {
    const { prompt, samples, aspectRatio, size } = context;
    const threadId = runtimeContext.get("threadId") as string;
    const resourceId = runtimeContext.get("resourceId") as string;
    const referenceImages = runtimeContext.get(
      "referenceImages"
    ) as ReferenceImage[];

    return await generateImages(prompt, {
      threadId,
      resourceId,
      referenceImages,
      imageOptions: {
        samples,
        aspectRatio: aspectRatio as unknown as ImageAspectRatio,
        size: size as unknown as ImageSize,
      },
    });
  },
});

const generateImages = async (
  prompt: string,
  context: ImageGenerationToolContext
) => {
  if (!imageHandler) {
    await initImageGenerationTool();
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  const generatedImages: GeneratedImage[] = Array.from(
    { length: context.imageOptions.samples },
    () => ({
      imageId: uuidv4(),
      status: "generating",
      url: undefined,
    })
  );

  const imageGenerationPrompt: any[] = [{ text: prompt }];
  const referencedImages = context.referenceImages ?? [];
  if (referencedImages.length > 0) {
    for (const refImage of referencedImages) {
      imageGenerationPrompt.push({
        inlineData: {
          mimeType: refImage.mimeType,
          data: refImage.dataBase64,
        },
      });
    }
  }

  for (let i = 0; i < generatedImages.length; i++) {
    const actualImage = generatedImages[i];

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: imageGenerationPrompt,
      config: {
        imageConfig: {
          aspectRatio: context.imageOptions.aspectRatio,
          imageSize: context.imageOptions.size,
        },
        responseModalities: ["Image"],
      },
    });

    if (!response.candidates) {
      throw new Error("No candidates in the image generation response");
    }

    if (!response.candidates[0]) {
      throw new Error("No images generated from the prompt");
    }

    for (const part of response.candidates[0].content?.parts || []) {
      if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
        const buffer = base64ToUint8Array(part.inlineData.data);
        const threadId = context.threadId;
        const imageId = uuidv4();
        const imageName = `${threadId}/${imageId}`;

        await imageHandler?.persist(
          imageName,
          {
            mimeType: part.inlineData.mimeType,
            size: buffer.length,
          },
          buffer
        );

        actualImage.status = "generated";
        actualImage.url = `https://localhost:3000/weavebff/api/v1/weavejs/chatId/${threadId}/images/${imageId}`;
      }
    }
  }

  return generatedImages;
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  return new Uint8Array(Buffer.from(cleanBase64, "base64"));
};
