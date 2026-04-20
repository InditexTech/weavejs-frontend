// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCollaborationRoom } from "@/store/store";
import { Archive, Link, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHandleRoomThumbnailChange } from "../hooks/use-handle-room-thumbnail-change";
import { RoomKind } from "../overlay/create-room";
import { cn } from "@/lib/utils";

type RoomPageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  room: any;
  kind: RoomKind;
};

export const RoomPage = ({ room, kind }: Readonly<RoomPageProps>) => {
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const imageFallbackRef = React.useRef<HTMLDivElement | null>(null);

  const setRoomsRoomId = useCollaborationRoom((state) => state.setRoomsRoomId);
  const setRoomsEditVisible = useCollaborationRoom(
    (state) => state.setRoomsEditVisible,
  );
  const setRoomsDeleteVisible = useCollaborationRoom(
    (state) => state.setRoomsDeleteVisible,
  );
  const setRoomsAccessVisible = useCollaborationRoom(
    (state) => state.setRoomsAccessVisible,
  );

  const navigate = useNavigate();

  const thumbnail = useHandleRoomThumbnailChange({ room });

  return (
    <div
      key={`${room.roomId}`}
      role="button"
      className={cn(
        "group relative aspect-video border-[0.5px] border-[#c9c9c9] rounded-lg overflow-hidden flex justify-center items-center cursor-pointer",
        {
          ["aspect-video"]: kind === "showcase",
          ["aspect-auto"]: ["standalone", "templates"].includes(kind),
        },
      )}
      onClick={() => {
        switch (kind) {
          case "showcase":
            navigate({ to: `/rooms/${room.roomId}` });
            break;
          case "standalone":
            navigate({ to: `/use-cases/standalone/${room.roomId}` });
            break;
          case "templates":
            navigate({ to: `/use-cases/templates/${room.roomId}` });
            break;

          default:
            break;
        }
      }}
    >
      {["standalone", "templates"].includes(kind) && (
        <>
          <div className="w-full h-full flex justify-start items-center gap-3 px-5 py-3">
            {room.status === "archived" && (
              <Badge variant="destructive" className="text-sm">
                archived
              </Badge>
            )}
            <span className="font-light text-xl">{room.name}</span>
          </div>
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition" />
          <div className="absolute top-2 right-2 max-w-[calc(100%-24px)] p-2 hidden group-hover:flex transition gap-2">
            <button
              className="cursor-pointer hover:text-[#c9c9c9]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setRoomsRoomId(room.roomId);
                setRoomsAccessVisible(true);
              }}
            >
              <Link strokeWidth={1} size={20} />
            </button>
            {room.RoomUserModels?.[0].role === "owner" && (
              <>
                <button
                  className="cursor-pointer hover:text-[#c9c9c9]"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setRoomsRoomId(room.roomId);
                    setRoomsEditVisible(true);
                  }}
                >
                  <Pencil strokeWidth={1} size={20} />
                </button>
                {room.status !== "archived" && (
                  <button
                    className="cursor-pointer hover:text-[#c9c9c9]"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setRoomsRoomId(room.roomId);
                      setRoomsDeleteVisible(true);
                    }}
                  >
                    <Archive strokeWidth={1} size={20} />
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
      {["showcase"].includes(kind) && thumbnail && (
        <>
          <img
            ref={imageRef}
            src={thumbnail}
            alt={`Thumbnail of room ${room.name}`}
            className="absolute top-0 left-0 right-0 bottom-0 w-full h-full object-cover bg-[#ffffff]"
            onLoad={() => {
              if (imageFallbackRef.current) {
                imageFallbackRef.current.style.display = "none";
              }
              if (imageRef.current) {
                imageRef.current.style.display = "flex";
              }
            }}
            onError={(e) => {
              console.log("error loading thumbnail", e);
              if (imageRef.current) {
                imageRef.current.style.display = "none";
              }
            }}
          />
          <div
            ref={imageFallbackRef}
            className="absolute top-0 left-0 right-0 bottom-0 w-full h-full w-[calc(100%-1px)] h-[calc(100%-1px)] flex flex-col justify-center items-center"
          ></div>
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition" />
          <div className="absolute top-3 right-3 max-w-[calc(100%-24px)] border-[0.5px] border-[#c9c9c9] bg-white p-2 hidden group-hover:flex transition gap-2">
            <button
              className="cursor-pointer hover:text-[#c9c9c9]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setRoomsRoomId(room.roomId);
                setRoomsAccessVisible(true);
              }}
            >
              <Link strokeWidth={1} size={20} />
            </button>
            {room.RoomUserModels?.[0].role === "owner" && (
              <>
                <button
                  className="cursor-pointer hover:text-[#c9c9c9]"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setRoomsRoomId(room.roomId);
                    setRoomsEditVisible(true);
                  }}
                >
                  <Pencil strokeWidth={1} size={20} />
                </button>
                <button
                  className="cursor-pointer hover:text-[#c9c9c9]"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setRoomsRoomId(room.roomId);
                    setRoomsDeleteVisible(true);
                  }}
                >
                  <Archive strokeWidth={1} size={20} />
                </button>
              </>
            )}
          </div>
          <div className="absolute top-3 left-3 flex gap-1 justify-start items-center">
            {["showcase"].includes(kind) && (
              <Badge
                variant="outline"
                className="text-sm font-light bg-white p-3 py-2"
              >
                {room.pages} pages
              </Badge>
            )}
            {room.status === "archived" && (
              <Badge variant="destructive" className="text-sm">
                archived
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 right-3 left-3 w-[calc(100%)] flex justify-between items-end gap-2">
            <div className="w-auto bg-black rounded-lg p-3 py-2 font-light text-sm text-white max-w-[calc(100%-24px)] truncate">
              {room.name}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
