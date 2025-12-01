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
} from "../agents/image-generator-editor-agent";
import { MastraUnion } from "@mastra/core/action";

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
  }),
  outputSchema: z.object({
    images: z.array(
      z.object({
        imageId: z.string(),
        status: z.enum(["generating", "generated", "failed"]),
        url: z.string().optional(),
      })
    ),
  }),
  execute: async ({ runtimeContext, mastra, context }) => {
    const logger = mastra?.getLogger();

    const { prompt } = context;

    logger?.info(`Generating image with prompt: ${prompt}`);

    const roomId = runtimeContext.get("roomId") as string;
    const threadId = runtimeContext.get("threadId") as string;
    const resourceId = runtimeContext.get("resourceId") as string;
    const referenceImages = runtimeContext.get(
      "referenceImages"
    ) as ReferenceImage[];

    const imageOption: ImageOptions = runtimeContext.get("imageOptions");
    const samples = imageOption.samples;
    const aspectRatio = imageOption.aspectRatio;
    const imageSize = imageOption.imageSize;

    logger?.info(
      `Generating image with params: samples=${samples}, aspectRatio=${aspectRatio}, imageSize=${imageSize}`
    );

    const images = await generateImages(mastra, prompt, {
      roomId,
      threadId,
      resourceId,
      referenceImages,
      imageOptions: {
        samples,
        aspectRatio: aspectRatio as unknown as ImageAspectRatio,
        imageSize: imageSize as unknown as ImageSize,
      },
    });

    logger?.info(
      `Generated [${images.length}] images: ${JSON.stringify(images, null, 2)}`
    );

    return { images };
  },
});

const generateImages = async (
  mastra: MastraUnion | undefined,
  prompt: string,
  context: ImageGenerationToolContext
) => {
  const logger = mastra?.getLogger();

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageGenerationPrompt: any[] = [
    { text: `${prompt}. Only generate a single image.` },
  ];
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

    logger?.info(`Generating image ${i + 1} of ${generatedImages.length}`);
    logger?.info(
      `Generating image prompt: ${prompt}. Only generate a single image.`
    );

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: imageGenerationPrompt,
      config: {
        imageConfig: {
          aspectRatio: context.imageOptions.aspectRatio,
          imageSize: context.imageOptions.imageSize,
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
        const roomId = context.roomId;
        const threadId = context.threadId;
        const imageId = uuidv4();
        const imageName = `${roomId}/${threadId}/${imageId}`;

        await imageHandler?.persist(
          imageName,
          {
            mimeType: part.inlineData.mimeType,
            size: buffer.length,
          },
          buffer
        );

        actualImage.status = "generated";
        actualImage.url = `https://localhost:3000/weavebff/api/v1/weavejs/rooms/${roomId}/chats/${threadId}/images/${imageId}`;
      }
    }
  }

  return generatedImages;
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  return new Uint8Array(Buffer.from(cleanBase64, "base64"));
};
