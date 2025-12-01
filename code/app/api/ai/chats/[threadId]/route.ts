import { NextResponse } from "next/server";
import { mastra } from "@/mastra";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
} from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { deleteChat, loadChat, saveChatMessages } from "@/mastra/manager/chat";
import z from "zod";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { ImageGeneratorRuntimeContext } from "@/mastra/agents/image-generator-editor-agent";

export async function GET(
  req: Request,
  context: { params: { threadId: string } }
) {
  const { threadId } = context.params;
  const roomId = req.headers.get("ai_room_id");
  const resourceId = req.headers.get("ai_resource_id");

  if (!roomId) {
    return NextResponse.json(
      { error: "Missing ai_room_id header" },
      { status: 400 }
    );
  }
  if (!resourceId) {
    return NextResponse.json(
      { error: "Missing ai_resource_id header" },
      { status: 400 }
    );
  }

  try {
    const chat = await loadChat(roomId, threadId, resourceId);

    return NextResponse.json(chat);
  } catch (ex) {
    console.warn(`Error loading chat with chatId [${threadId}].`, ex);
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }
}

export async function POST(
  req: Request,
  context: { params: { threadId: string } }
) {
  const { threadId } = context.params;
  const roomId = req.headers.get("ai_room_id");
  const resourceId = req.headers.get("ai_resource_id");

  if (!roomId) {
    return NextResponse.json(
      { error: "Missing ai_room_id header" },
      { status: 400 }
    );
  }

  if (!resourceId) {
    return NextResponse.json(
      { error: "Missing ai_resource_id header" },
      { status: 400 }
    );
  }

  const { messages, imageOptions } = await req.json();

  const referenceImages = [];
  let index = 1;
  for (const msg of messages) {
    for (const part of msg.parts) {
      if (part.type === "file") {
        referenceImages.push({
          index: index,
          name: `image ${index}`,
          dataBase64: part.url.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: part.mediaType,
        });
        index++;
      }
    }
  }

  const runtimeContext = new RuntimeContext<ImageGeneratorRuntimeContext>();
  runtimeContext.set("roomId", roomId);
  runtimeContext.set("threadId", threadId);
  runtimeContext.set("resourceId", resourceId);
  runtimeContext.set("referenceImages", referenceImages);
  runtimeContext.set("imageOptions", imageOptions);

  const imageGenerationEditorAgent = mastra.getAgent(
    "imageGeneratorEditorAgent"
  );
  const stream = await imageGenerationEditorAgent.stream(
    convertToModelMessages(messages),
    {
      runtimeContext,
      memory: {
        thread: threadId,
        resource: resourceId,
      },
      maxSteps: 1,
      structuredOutput: {
        schema: z.object({
          images: z.array(
            z.object({
              imageId: z.string(),
              status: z.enum(["generating", "generated", "failed"]),
              url: z.string(),
            })
          ),
        }),
        jsonPromptInjection: true,
      },
    }
  );

  const userMessage = messages[messages.length - 1];
  const removedImagesParts = [
    {
      ...userMessage,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parts: userMessage.parts.filter((part: any) => part.type !== "file"),
    },
  ];

  console.log("message", JSON.stringify(removedImagesParts, null, 2));

  // Transform stream into AI SDK format and create UI messages stream
  const uiMessageStream = createUIMessageStream({
    originalMessages: removedImagesParts,
    execute: async ({ writer }) => {
      for await (const part of toAISdkFormat(stream, {
        from: "agent",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any) {
        writer.write(part);
      }
    },
    onFinish: ({ messages }) => {
      saveChatMessages(roomId, threadId, resourceId, messages);
    },
  });

  // Create a Response that streams the UI message stream to the client
  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}

export async function DELETE(
  req: Request,
  context: { params: { threadId: string } }
) {
  const { threadId } = context.params;
  const roomId = req.headers.get("ai_room_id");
  const resourceId = req.headers.get("ai_resource_id");

  if (!roomId) {
    return NextResponse.json(
      { error: "Missing ai_room_id header" },
      { status: 400 }
    );
  }

  if (!resourceId) {
    return NextResponse.json(
      { error: "Missing ai_resource_id header" },
      { status: 400 }
    );
  }

  try {
    const chatDeleted = await deleteChat(roomId, threadId, resourceId);
    if (chatDeleted) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Error deleting the chat" },
        { status: 500 }
      );
    }
  } catch (ex) {
    console.warn(`Error loading chat with chatId [${threadId}].`, ex);
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }
}
