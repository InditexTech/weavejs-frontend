// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { getRoom } from "@/api/get-room";
import { cn } from "@/lib/utils";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, Pencil } from "lucide-react";
import { useHandlePageThumbnailChange } from "../hooks/use-handle-page-thumbnail-change";
import { Badge } from "@/components/ui/badge";

type PageGridProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any;
  index: number;
};

export const PageGrid = ({ page, index }: Readonly<PageGridProps>) => {
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const imageFallbackRef = React.useRef<HTMLDivElement | null>(null);

  const instance = useWeave((state) => state.instance);

  const roomId = useCollaborationRoom((state) => state.room);
  const actualPageId = useCollaborationRoom(
    (state) => state.pages.actualPageId,
  );
  const setPagesActualPage = useCollaborationRoom(
    (state) => state.setPagesActualPage,
  );
  const setPagesActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );
  const setPagesListVisible = useCollaborationRoom(
    (state) => state.setPagesListVisible,
  );
  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
  );
  const setRoomsRoomId = useCollaborationRoom((state) => state.setRoomsRoomId);
  const setRoomsPageId = useCollaborationRoom((state) => state.setRoomsPageId);
  const setRoomsPageEditVisible = useCollaborationRoom(
    (state) => state.setRoomsPageEditVisible,
  );
  const setRoomsPageDeleteVisible = useCollaborationRoom(
    (state) => state.setRoomsPageDeleteVisible,
  );

  const queryClient = useQueryClient();

  const handleSwitchPage = React.useCallback(async () => {
    if (!instance) return;

    const store = instance.getStore() as WeaveStoreAzureWebPubsub;

    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["roomData", page.pageId],
        queryFn: () => getRoom(page.pageId),
      });

      store.switchToRoom(page.pageId, data);
      // eslint-disable-next-line no-empty
    } catch {
      store.switchToRoom(page.pageId, undefined);
    }

    setPagesActualPage(page.index);
    setPagesActualPageId(page.pageId);
    setPagesListVisible(false);
    setPagesGridVisible(false);
  }, [
    instance,
    page,
    queryClient,
    setPagesActualPage,
    setPagesActualPageId,
    setPagesGridVisible,
    setPagesListVisible,
  ]);

  const thumbnail = useHandlePageThumbnailChange({ page });

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        className={cn(
          "group relative aspect-video border-[0.5px] border-[#c9c9c9] rounded-lg overflow-hidden flex justify-start items-end p-2 hover:bg-[#f0f0f0] transition-colors cursor-pointer",
          {
            ["outline outline-2 outline-offset-2 outline-[#cc0000]"]:
              actualPageId === page.pageId,
          },
        )}
        onClick={handleSwitchPage}
      >
        {thumbnail && (
          <>
            <img
              ref={imageRef}
              src={thumbnail}
              alt={`Thumbnail of page ${page.name}`}
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
              className="absolute top-0 left-0 right-0 bottom-0 object-cover bg-[#ffffff] w-full h-full"
            />
            <div
              ref={imageFallbackRef}
              className="absolute top-[0.5px] left-[0.5px] right-[0.5px] bottom-[0.5px] w-[calc(100%-1px)] h-[calc(100%-1px)] flex flex-col justify-center items-center"
            ></div>
          </>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition" />
        <div className="absolute bottom-3 right-3 left-3 w-[calc(100%-24px)] flex justify-between items-end gap-2">
          <Badge className="text-sm font-light p-3 py-2">
            {index + 1}. {page.name}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 max-w-[calc(100%-24px)] bg-white p-2 hidden group-hover:flex transition gap-2 border-[0.5px] border-[#c9c9c9]">
          <button
            className="cursor-pointer hover:text-[#c9c9c9]"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setRoomsRoomId(roomId ?? "");
              setRoomsPageId(page.pageId);
              setRoomsPageEditVisible(true);
            }}
          >
            <Pencil strokeWidth={1} size={20} />
          </button>
          <button
            className="cursor-pointer hover:text-[#c9c9c9]"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setRoomsRoomId(roomId ?? "");
              setRoomsPageId(page.pageId);
              setRoomsPageDeleteVisible(true);
            }}
          >
            <Archive strokeWidth={1} size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
