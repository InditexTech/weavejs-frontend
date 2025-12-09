import { v4 as uuidv4 } from "uuid";
import { createTool } from "@mastra/core/tools";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { ImagesPersistenceHandler } from "../manager/images";
import {
  ImageGeneratorRuntimeContext,
  ReferenceImage,
} from "../agents/image-generator-editor-agent";
import { MastraUnion } from "@mastra/core/action";
import { ImageOptions } from "@/store/ia-chat";

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

    const roomId = runtimeContext.get("roomId") as string;
    const threadId = runtimeContext.get("threadId") as string;
    const resourceId = runtimeContext.get("resourceId") as string;
    const referenceImages = runtimeContext.get(
      "referenceImages"
    ) as ReferenceImage[];

    const imageOption: ImageOptions = runtimeContext.get("imageOption");
    const model = imageOption.model;
    const samples = imageOption.samples;
    const aspectRatio = imageOption.aspectRatio;
    const quality = imageOption.quality;
    const size = imageOption.size;

    logger?.info(`Generating image prompt: ${prompt}`);
    logger?.info(`Related images: ${referenceImages.length ?? 0}`);
    logger?.info(
      `With options: model=${model}, samples=${samples}, aspectRatio=${aspectRatio}, quality=${quality ? quality : "-"}, imageSize=${size}`
    );

    const images = await generateImages(mastra, prompt, {
      roomId,
      threadId,
      resourceId,
      referenceImages,
      imageOption,
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
  if (!imageHandler) {
    await initImageGenerationTool();
  }

  const model = context.imageOption.model;

  if (model === "openai/gpt-image-1") {
    return await generateImagesFromChatGPT({ mastra, prompt, context });
  }
  if (model === "gemini/gemini-3-pro-image-preview") {
    return await generateImagesFromGemini({ mastra, prompt, context });
  }

  throw new Error(`Image model [${model}] not supported yet.`);
};

const generateImagesFromGemini = async ({
  mastra,
  prompt,
  context,
}: {
  mastra: MastraUnion | undefined;
  prompt: string;
  context: ImageGenerationToolContext;
}) => {
  const logger = mastra?.getLogger();

  if (context.imageOption.model !== "gemini/gemini-3-pro-image-preview") {
    throw new Error(
      `Image model [${context.imageOption.model}] not supported in Gemini generator.`
    );
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  const generatedImages: GeneratedImage[] = Array.from(
    { length: context.imageOption.samples },
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
    logger?.info(`Generating image prompt: ${imageGenerationPrompt[0].text}`);

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: imageGenerationPrompt,
      config: {
        imageConfig: {
          aspectRatio: context.imageOption.aspectRatio,
          imageSize: context.imageOption.size,
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

const generateImagesFromChatGPT = async ({
  mastra,
  prompt,
  context,
}: {
  mastra: MastraUnion | undefined;
  prompt: string;
  context: ImageGenerationToolContext;
}) => {
  const logger = mastra?.getLogger();

  if (context.imageOption.model !== "openai/gpt-image-1") {
    throw new Error(
      `Image model [${context.imageOption.model}] not supported in ChatGPT generator.`
    );
  }

  const generatedImages: GeneratedImage[] = Array.from(
    { length: context.imageOption.samples },
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
    try {
      const actualImage = generatedImages[i];

      logger?.info(`Generating image ${i + 1} of ${generatedImages.length}`);
      logger?.info(`Generating image prompt: ${imageGenerationPrompt[0].text}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2 * 60 * 1000); // 2 minutes

      const requestBody = {
        model: "gpt-image-1",
        prompt,
        n: context.imageOption.samples,
        size: 1,
        quality: context.imageOption.quality,
        moderation: "auto",
        output_format: "png",
      };

      const endpoint = `${process.env.AZURE_CS_ENDPOINT}/openai/deployments/gpt-image-1/images/generations?api-version=2025-04-01-preview`;
      console.log(endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Api-Key": process.env.AZURE_CS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      console.log("GTP RES", response.status);

      clearTimeout(timeout);

      if (!response.ok) {
        const jsonData = await response.json();
        console.log("GTP ERROR", jsonData);
        throw new Error("Error generating the images");
      }

      const jsonData = await response.json();

      for (let i = 0; i < jsonData.data.length; i++) {
        const buffer = base64ToUint8Array(jsonData.data[i].b64_json);
        const roomId = context.roomId;
        const threadId = context.threadId;
        const imageId = uuidv4();
        const imageName = `${roomId}/${threadId}/${imageId}`;

        await imageHandler?.persist(
          imageName,
          {
            mimeType: "image/png",
            size: buffer.length,
          },
          buffer
        );

        actualImage.status = "generated";
        actualImage.url = `https://localhost:3000/weavebff/api/v1/weavejs/rooms/${roomId}/chats/${threadId}/images/${imageId}`;
      }
    } catch (ex) {
      console.log("GTP EXCEPTION", ex);
    }
  }

  return generatedImages;
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  return new Uint8Array(Buffer.from(cleanBase64, "base64"));
};
