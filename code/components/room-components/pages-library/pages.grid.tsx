// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import React from "react";
import { getPages } from "@/api/pages/get-pages";
import { useCollaborationRoom } from "@/store/store";
import { toast } from "sonner";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PageGrid } from "./page.grid";
import { Plus } from "lucide-react";
import { postPage } from "@/api/pages/post-page";
import { useWeave } from "@inditextech/weave-react";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import { getRoom } from "@/api/get-room";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useOnInView } from "react-intersection-observer";

export const PagesGrid = () => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const createToastRef = React.useRef<string | number | null>(null);

  const [firstLoad, setFirstLoad] = React.useState<boolean>(true);
  const [root, setRoot] = React.useState<Element | null>(null);

  const instance = useWeave((state) => state.instance);

  const roomId = useCollaborationRoom((state) => state.room);

  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
  );
  const setPagesActualPage = useCollaborationRoom(
    (state) => state.setPagesActualPage,
  );
  const setPagesActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );
  const setPagesAmount = useCollaborationRoom((state) => state.setPagesAmount);
  const setPagesActualPages = useCollaborationRoom(
    (state) => state.setPagesActualPages,
  );

  React.useEffect(() => {
    if (viewportRef.current) {
      setRoot(viewportRef.current);
    }
  }, []);

  const queryClient = useQueryClient();

  const handleSwitchPage = React.useCallback(
    async (pageIndex: number, pageId: string) => {
      if (!instance) return;

      const queryKeyPages = ["getPages", roomId ?? ""];
      queryClient.invalidateQueries({ queryKey: queryKeyPages });

      const queryKey = ["getPagesInfinite", roomId ?? ""];
      queryClient.invalidateQueries({ queryKey });

      const store = instance.getStore() as WeaveStoreAzureWebPubsub;

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ["roomData", pageId],
          queryFn: () => getRoom(pageId),
        });

        store.switchToRoom(pageId, data);
        // eslint-disable-next-line no-empty
      } catch {
        store.switchToRoom(pageId, undefined);
      }

      setPagesActualPage(pageIndex);
      setPagesActualPageId(pageId);
    },
    [instance, queryClient, roomId, setPagesActualPage, setPagesActualPageId],
  );

  const query = useInfiniteQuery({
    queryKey: ["getPagesInfiniteGrid", roomId ?? ""],
    initialPageParam: 0 as number,
    getNextPageParam: (lastPage, allPages) => {
      const loadedSoFar = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0,
      );
      if (loadedSoFar < lastPage.total) {
        return loadedSoFar; // next offset
      }
      return undefined; // no more pages
    },
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      if (!roomId) return { items: [], total: 0 };

      return (await getPages(
        roomId,
        "active",
        pageParam,
        12,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as any;
    },
    refetchOnWindowFocus: false,
    enabled: !!roomId,
  });

  React.useEffect(() => {
    if (firstLoad && !query.isFetching) {
      setFirstLoad(false);
    }
  }, [firstLoad, query.isFetching]);

  const ref = useOnInView(
    (inView) => {
      if (inView) {
        query.fetchNextPage();
      }
    },
    {
      threshold: 0.01,
      rootMargin: "0px",
      root,
      skip: !root,
      trackVisibility: true,
      delay: 500,
    },
  );

  React.useEffect(() => {
    if (query.data?.pages) {
      const totalPages = query.data.pages[0]?.total || 0;
      setPagesAmount(totalPages);
    }
  }, [query.data, setPagesAmount]);

  const allPages = React.useMemo(() => {
    return query.data?.pages.flatMap((page) => page.items ?? []) || [];
  }, [query.data]);

  React.useEffect(() => {
    setPagesActualPages(allPages);
  }, [allPages, setPagesActualPages]);

  const createPage = useMutation({
    mutationFn: async (params: {
      pageId: string;
      name: string;
      thumbnail: string;
    }) => {
      if (!roomId) {
        throw new Error("Room ID is required to create a page");
      }

      return await postPage(roomId, params);
    },
    onSettled: () => {
      if (createToastRef.current) {
        toast.dismiss(createToastRef.current);
      }
    },
    onSuccess: (_, { pageId }) => {
      handleSwitchPage(allPages.length + 1, pageId);
    },
    onError: (error) => {
      console.error("Error creating page", error);
    },
  });

  return (
    <ScrollArea.Root className="w-full h-[calc(100%-60px-74px)]">
      <ScrollArea.Viewport className="@container h-full" ref={viewportRef}>
        {firstLoad && query.isFetching && !query.isFetchingNextPage && (
          <div className="w-full h-full flex justify-center items-center">
            loading pages
          </div>
        )}
        {!query.isFetching && allPages.length === 0 && (
          <div className="w-full h-full flex justify-center items-center">
            no pages
          </div>
        )}
        <div className="w-full grid grid-cols-1 @min-[800px]:grid-cols-2 @min-[1200px]:grid-cols-3 @min-[1600px]:grid-cols-4 justify-center items-center gap-5 px-[20px] py-[20px]">
          {!firstLoad &&
            allPages.length > 0 &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            allPages.map((page: any, index: number) => (
              <PageGrid key={page.pageId} page={page} index={index} />
            ))}
          {query.hasNextPage && (
            <div
              ref={(el) => {
                ref(el);
              }}
              className="aspect-video border-[0.5px] border-[#c9c9c9] rounded flex justify-center items-center hover:bg-[#f0f0f0] transition-colors cursor-pointer"
            >
              more pages
            </div>
          )}
          {!query.isFetching && (
            <div className="flex flex-col gap-2">
              <button
                className="aspect-video border-[0.5px] border-[#c9c9c9] rounded-lg overflow-hidden flex justify-center items-center hover:bg-black/5 transition-colors cursor-pointer"
                onClick={() => {
                  createToastRef.current = toast.loading("Creating page...", {
                    duration: Infinity,
                  });
                  setPagesGridVisible(false);
                  createPage.mutate({
                    pageId: `${roomId}-${uuidv4()}`,
                    name: `New page`,
                    thumbnail: "",
                  });
                }}
              >
                <Plus strokeWidth={1} size={40} />
              </button>
            </div>
          )}
        </div>
        {query.isFetchingNextPage && (
          <div className="flex flex-col gap-2">
            <div className="aspect-video h-[100px] border-[0.5px] border-[#c9c9c9] rounded flex justify-center items-center hover:bg-[#f0f0f0] transition-colors cursor-pointer"></div>
            <div className="w-full text-xs font-light text-center">
              Loading more pages...
            </div>
          </div>
        )}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" />
    </ScrollArea.Root>
  );
};
