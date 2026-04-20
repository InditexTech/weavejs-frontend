// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplatesUseCase } from "../../store/store";
import { cn } from "@/lib/utils";
import { useAddToRoom } from "../../store/add-to-room";
import { CheckIcon } from "lucide-react";
import { getPages } from "@/api/pages/get-pages";

const PAGES_LIMIT = 100;

export function AddToRoomSelectPage() {
  const addToRoomOpen = useTemplatesUseCase((state) => state.addToRoom.open);

  const room = useAddToRoom((state) => state.room);
  const page = useAddToRoom((state) => state.page);
  const setPage = useAddToRoom((state) => state.setPage);
  const setStep = useAddToRoom((state) => state.setStep);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pages, setPages] = React.useState<any[]>([]);

  const query = useInfiniteQuery({
    queryKey: ["getPagesInfiniteList", room?.id ?? ""],
    queryFn: async ({ pageParam }) => {
      if (!room?.id) return { items: [], total: 0 };

      return (await getPages(
        room?.id,
        "active",
        pageParam,
        PAGES_LIMIT,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as any;
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: undefined,
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
    enabled: addToRoomOpen,
  });

  React.useEffect(() => {
    if (!query.data) return;
    setPages(query.data?.pages.flatMap((page) => page.items) ?? []);
  }, [query.data]);

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  return (
    <>
      <div className="w-full h-full grid grid-cols grid-rows-[auto_1fr] gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Select the page where you want to add the template.
        </DialogDescription>
        <div className="w-full h-[calc(100dvh-48px-12px-72px-25px-48px-140px-48px)] border border-[#c9c9c9]">
          <ScrollArea className="w-full h-full">
            {pages.length > 0 &&
              pages.map((pageInfo, index) => {
                console.log({ pageInfo, page });
                return (
                  <div
                    key={pageInfo.pageId}
                    className={cn(
                      "flex gap-3  h-[40px] justify-between items-center font-inter text-sm p-2 py-2 cursor-pointer border-t border-[#c9c9c9]",
                      {
                        ["border-t-0"]: index === 0,
                      },
                    )}
                    onClick={() => {
                      setPage({ id: pageInfo.pageId, name: pageInfo.name });
                    }}
                  >
                    <div>{pageInfo?.name}</div>
                    {page?.id === pageInfo?.pageId && (
                      <div>
                        <CheckIcon strokeWidth={1} />
                      </div>
                    )}
                  </div>
                );
              })}
            <div ref={ref} className="h-[0px]" />
            {query.isFetchingNextPage && (
              <p className="font-inter text-xs uppercase text-center py-4">
                loading more...
              </p>
            )}
          </ScrollArea>
        </div>
      </div>
      <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
      <DialogFooter>
        <Button
          type="button"
          className="cursor-pointer font-inter rounded-none"
          onClick={() => {
            setStep("select-room");
          }}
        >
          BACK
        </Button>
        <Button
          type="button"
          className="cursor-pointer font-inter rounded-none"
          disabled={!page || page.id.trim() === ""}
          onClick={() => {
            setStep("select-template");
          }}
        >
          CONTINUE
        </Button>
      </DialogFooter>
    </>
  );
}
