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
import { Page } from "./page";
import { Plus } from "lucide-react";
import { postPage } from "@/api/pages/post-page";
import { useWeave } from "@inditextech/weave-react";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import { getRoom } from "@/api/get-room";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useOnInView } from "react-intersection-observer";

export const PagesList = () => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const scrollLeftRef = React.useRef(0);
  const createToastRef = React.useRef<string | number | null>(null);

  const [firstLoad, setFirstLoad] = React.useState<boolean>(true);
  const [root, setRoot] = React.useState<Element | null>(null);

  const instance = useWeave((state) => state.instance);

  const roomId = useCollaborationRoom((state) => state.room);

  const setPagesListVisible = useCollaborationRoom(
    (state) => state.setPagesListVisible,
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

  const ref = useOnInView(
    (inView) => {
      if (inView) {
        query.fetchNextPage();
      }
    },
    {
      threshold: 0.1,
      rootMargin: "0px",
      root,
      skip: !root,
      trackVisibility: true,
      delay: 500,
    },
  );

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
    queryKey: ["getPagesInfiniteList", roomId ?? ""],
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
        5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as any;
    },
    refetchOnWindowFocus: false,
    enabled: roomId !== undefined,
  });

  React.useEffect(() => {
    if (firstLoad && !query.isFetching) {
      setFirstLoad(false);
    }
  }, [firstLoad, query.isFetching]);

  const allPages = React.useMemo(() => {
    return query.data?.pages.flatMap((page) => page.items ?? []) || [];
  }, [query.data]);

  const onScroll = React.useCallback(() => {
    if (!query.isFetching && viewportRef.current) {
      scrollLeftRef.current = viewportRef.current.scrollLeft;
    }
  }, [query]);

  React.useLayoutEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollLeft = scrollLeftRef.current;
    }
  }, [allPages]);

  React.useEffect(() => {
    setPagesActualPages(allPages);
  }, [allPages, setPagesActualPages]);

  React.useEffect(() => {
    if (query.data?.pages) {
      const totalPages = query.data.pages[0]?.total || 0;
      setPagesAmount(totalPages);
    }
  }, [query.data, setPagesAmount]);

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
    <ScrollArea.Root className="w-full h-full">
      <ScrollArea.Viewport ref={viewportRef} onScroll={onScroll}>
        <div className="flex shrink-0 justify-center items-start gap-0 px-[20px] py-[20px]">
          {firstLoad && query.isFetching && !query.isFetchingNextPage && (
            <div className="aspect-video w-[300px] flex justify-center items-center">
              loading pages
            </div>
          )}
          {!query.isFetching && allPages.length === 0 && (
            <div className="aspect-video w-[300px] flex justify-center items-center">
              no pages
            </div>
          )}
          {!firstLoad && allPages.length > 0 && (
            <>
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                allPages.map((page: any, index: number) => (
                  <Page key={page.pageId} page={page} index={index} />
                ))
              }
              {query.hasNextPage && (
                <div
                  ref={(el) => {
                    ref(el);
                  }}
                  className="w-[-16px] h-[1px]"
                />
              )}
            </>
          )}
          {query.isFetchingNextPage && (
            <div className="flex flex-col gap-2">
              <div className="aspect-video w-[300px] border-[0.5px] border-[#c9c9c9] flex justify-center items-center hover:bg-[#f0f0f0] transition-colors cursor-pointer"></div>
              <div className="w-full text-xs font-light text-center">
                Loading more pages...
              </div>
            </div>
          )}
          {!query.isFetching && !query.isFetchingNextPage && (
            <div className="flex flex-col gap-2 ml-3">
              <button
                className="aspect-video w-[400px] border-[0.5px] border-[#c9c9c9] rounded-lg overflow-hidden flex justify-center items-center hover:bg-black/5 transition-colors cursor-pointer"
                onClick={() => {
                  createToastRef.current = toast.loading("Creating page...", {
                    duration: Infinity,
                  });
                  setPagesListVisible(false);
                  createPage.mutate({
                    pageId: `${roomId}-${uuidv4()}`,
                    name: `New page`,
                    thumbnail: "",
                  });
                }}
              >
                <Plus strokeWidth={1} size={40} />
              </button>
              <div className="w-full text-xs font-light text-center text-white">
                New page
              </div>
            </div>
          )}
        </div>
      </ScrollArea.Viewport>

      <ScrollArea.Scrollbar orientation="horizontal" />
    </ScrollArea.Root>
  );
};
