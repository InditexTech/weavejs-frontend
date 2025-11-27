import { NextResponse } from "next/server";
import { getChats } from "@/mastra/manager/chat";

export async function GET(req: Request) {
  const resourceId = req.headers.get("ai_resource_id");

  if (!resourceId) {
    return NextResponse.json(
      { error: "Missing ai_resource_id header" },
      { status: 400 }
    );
  }

  try {
    const chats = await getChats(resourceId);

    return NextResponse.json({
      chats,
    });
  } catch (ex) {
    console.warn(`Error loading chats with resourceId [${resourceId}].`, ex);
    return NextResponse.json({
      chats: [],
    });
  }
}
