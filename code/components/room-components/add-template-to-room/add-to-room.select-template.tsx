// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { DialogDescription } from "@/components/ui/dialog";
import React from "react";
import { getTemplates } from "@/api/get-templates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutTemplateIcon, LoaderCircle } from "lucide-react";
import { AddToRoomTemplate } from "./add-to-room.template";
import { useWeave } from "@inditextech/weave-react";
import { useAddTemplateToRoom } from "@/store/add-template-to-room";
import { TemplateEntity } from "../templates-library/types";

const TEMPLATES_LIMIT = 20;

export function AddToRoomSelectTemplate() {
  const instance = useWeave((state) => state.instance);

  const selectedImages = useAddTemplateToRoom((state) => state.images);
  const visible = useAddTemplateToRoom((state) => state.visible);
  const room = useAddTemplateToRoom((state) => state.room);

  const [templates, setTemplates] = React.useState<TemplateEntity[]>([]);

  const query = useInfiniteQuery({
    queryKey: ["getTemplates", room?.id ?? "", "imageTemplate"],
    queryFn: async ({ pageParam }) => {
      if (!room) {
        return [];
      }

      return await getTemplates(
        room.id,
        "imageTemplate",
        selectedImages.length,
        pageParam as number,
        TEMPLATES_LIMIT,
      );
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: 0,
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
    enabled: visible,
  });

  React.useEffect(() => {
    if (!query.data) return;
    setTemplates((prev: TemplateEntity[]) =>
      (query.data?.pages.flatMap((page) => page.items) ?? []).map(
        (newItem: TemplateEntity) =>
          prev.find(
            (oldItem) =>
              oldItem.templateId === newItem.templateId &&
              oldItem.updatedAt === newItem.updatedAt,
          ) || newItem,
      ),
    );
  }, [query.data]);

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  return (
    <>
      <div className="grid grid-cols gir-rows-[auto_1fr_auto_auto] gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Select the template to use.
        </DialogDescription>
        <div className="w-full h-[calc(100dvh-48px-32px-72px-20px-110px)] border-[0.5px] border-[#c9c9c9]">
          {!query.isLoading &&
            !query.isFetchingNextPage &&
            templates.length === 0 && (
              <div className="w-full h-full flex justify-center items-center">
                <div className="w-full p-5 flex flex-col gap-2 justify-center items-center">
                  <LayoutTemplateIcon strokeWidth={1} size={32} />
                  <div className="font-inter text-base mb-3">
                    No templates defined
                  </div>
                </div>
              </div>
            )}
          {query.isLoading && !query.isFetchingNextPage && (
            <div className="col-span-1 w-full h-[calc(100%-57px)] px-5 flex flex-col justify-center items-center text-sm text-center font-inter font-light">
              <LoaderCircle
                strokeWidth={1}
                size={48}
                className="animate-spin"
              />
              <div className="flex flex-col justify-center items-center gap-1">
                <p className="font-light text-xl text-[#757575]">
                  LOADING IMAGE TEMPLATES
                </p>
                <p className="font-light text-base">Please wait...</p>
              </div>
            </div>
          )}
          {query.isFetched && templates.length > 0 && (
            <ScrollArea className="w-full h-full overflow-auto">
              <div
                className="w-full grid grid-cols-2 gap-5 p-5"
                onDragStart={(e) => {
                  if (!instance) {
                    return;
                  }

                  if (e.target instanceof HTMLImageElement) {
                    instance.startDrag("add-template-to-room");
                    instance.setDragProperties<{ templateData: string }>({
                      templateData: e.target.dataset.templateData ?? "",
                    });
                  }
                }}
              >
                {templates.length > 0 &&
                  templates.map((template) => {
                    return (
                      <AddToRoomTemplate
                        key={template.templateId}
                        template={template}
                      />
                    );
                  })}
                <div ref={ref} className="h-[0px]" />
                {query.isFetchingNextPage && (
                  <p className="font-inter text-xs uppercase text-center py-4">
                    loading more...
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </>
  );
}
