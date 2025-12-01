import { NextResponse } from "next/server";
import { getChats } from "@/mastra/manager/chat";

export async function GET(req: Request) {
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
    const chats = await getChats(roomId, resourceId);

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
