// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { LayoutGrid, PanelBottom } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPages } from "@/api/pages/get-pages";
import { useWeave } from "@inditextech/weave-react";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import { getRoom } from "@/api/get-room";
import { getPageByIndex } from "@/api/pages/get-page-by-index";
import { Divider } from "../overlay/divider";
import { useBreakpoint } from "../overlay/hooks/use-breakpoint";
import { Badge } from "@/components/ui/badge";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const PagesToolbar = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [navigatingToPage, setNavigatingToPage] = React.useState(false);
  const [page, setPage] = React.useState<number | undefined>(undefined);

  const instance = useWeave((state) => state.instance);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const roomId = useCollaborationRoom((state) => state.room);

  const actualPage = useCollaborationRoom((state) => state.pages.actualPage);
  const actualPageElement = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const pagesAmount = useCollaborationRoom((state) => state.pages.amount);

  const breakpoint = useBreakpoint();

  React.useEffect(() => {
    if (actualPage) {
      setPage(actualPage);
    }
  }, [actualPage]);

  const pagesListVisible = useCollaborationRoom(
    (state) => state.pages.listVisible,
  );
  const pagesGridVisible = useCollaborationRoom(
    (state) => state.pages.gridVisible,
  );
  const setPagesListVisible = useCollaborationRoom(
    (state) => state.setPagesListVisible,
  );
  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
  );
  const setPagesActualPage = useCollaborationRoom(
    (state) => state.setPagesActualPage,
  );
  const setPagesActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );

  const { data: roomPages, isFetched: pagesIsFetched } = useQuery({
    queryKey: ["getPages", roomId ?? ""],
    queryFn: () => {
      return getPages(roomId ?? "", "active", 0, 5);
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!roomId,
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (navigatingToPage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [navigatingToPage]);

  const handleSwitchPage = React.useCallback(
    async (pageIndex: number) => {
      if (!instance) return;

      if (!roomId) return;

      const store = instance.getStore() as WeaveStoreAzureWebPubsub;

      const pageElement = await queryClient.fetchQuery({
        queryKey: ["getPageByIndex", roomId, pageIndex],
        queryFn: () => getPageByIndex(roomId, pageIndex),
      });

      if (!pageElement) {
        return;
      }

      if (pageIndex > pagesAmount) {
        return;
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["roomData", pageElement.pageId],
          queryFn: () => getRoom(pageElement.pageId),
        });

        store.switchToRoom(pageElement.pageId, data);
        // eslint-disable-next-line no-empty
      } catch {
        store.switchToRoom(pageElement.pageId, undefined);
      }

      setPagesActualPage(pageIndex);
      setPagesActualPageId(pageElement.pageId);
      setNavigatingToPage(false);
    },
    [
      instance,
      queryClient,
      setPagesActualPage,
      setPagesActualPageId,
      roomId,
      pagesAmount,
    ],
  );

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        navigatingToPage
      ) {
        setNavigatingToPage(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigatingToPage]);

  const isRoomReady = useIsRoomReady();

  return (
    <>
      <ToolbarButton
        icon={<PanelBottom strokeWidth={1} />}
        onClick={() => {
          setPagesGridVisible(false);
          setPagesListVisible(!pagesListVisible);
        }}
        disabled={!isRoomReady || isRoomSwitching}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Toggle pages</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={
          navigatingToPage ? (
            <div className="font-mono text-xs flex gap-1 justify-center items-center">
              <input
                ref={inputRef}
                className="w-[40px] h-[20px] border border-[#c9c9c9] text-center text-xs"
                type="text"
                value={page ? `${page}` : ""}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setNavigatingToPage(false);
                    return;
                  }
                  if (e.key === "Enter" && page && page <= pagesAmount) {
                    handleSwitchPage(page);
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setPage(undefined);
                    return;
                  }

                  const numericValue = parseInt(value);
                  if (!isNaN(numericValue)) {
                    setPage(numericValue);
                  }
                }}
              />{" "}
              / {pagesIsFetched ? (roomPages?.total ?? "-") : "-"}
            </div>
          ) : (
            <Badge
              variant="outline"
              className="cursor-pointer font-mono text-xs"
            >
              {actualPageElement?.index ?? "-"} /{" "}
              {pagesIsFetched ? (roomPages?.total ?? "-") : "-"}
            </Badge>
          )
        }
        disabled={!isRoomReady || isRoomSwitching}
        onClick={() => {
          if (!navigatingToPage) {
            setNavigatingToPage(true);
          }
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Go to page</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<LayoutGrid strokeWidth={1} />}
        onClick={() => {
          setPagesListVisible(false);
          setPagesGridVisible(!pagesGridVisible);
        }}
        disabled={!isRoomReady || isRoomSwitching}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Grid view</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      {["2xl"].includes(breakpoint) && <Divider className="h-[20px]" />}
    </>
  );
};
