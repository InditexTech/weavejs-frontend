// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Button } from "@/components/ui/button";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useAddToRoom } from "../../store/add-to-room";
import { useTemplatesUseCase } from "../../store/store";
import { TemplateEntity } from "../templates/types";
import { getTemplates } from "@/api/get-templates";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutTemplateIcon } from "lucide-react";
import { AddToRoomTemplate } from "./add-to-room.template";

const TEMPLATES_LIMIT = 20;

export function AddToRoomSelectTemplate() {
  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const addToRoomOpen = useTemplatesUseCase((state) => state.addToRoom.open);

  const frameName = useAddToRoom((state) => state.frameName);
  const setFrameName = useAddToRoom((state) => state.setFrameName);
  const template = useAddToRoom((state) => state.template);
  const setStep = useAddToRoom((state) => state.setStep);

  const [templates, setTemplates] = React.useState<TemplateEntity[]>([]);

  const query = useInfiniteQuery({
    queryKey: ["getTemplates", instanceId],
    queryFn: async ({ pageParam }) => {
      if (!instanceId) {
        return [];
      }

      return await getTemplates(
        instanceId ?? "",
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
    enabled: addToRoomOpen,
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
        <div className="w-full h-[calc(100dvh-48px-32px-72px-20px-20px-62px-25px-48px-140px-500px)] border border-[#c9c9c9]">
          {templates.length === 0 && (
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-full p-5 flex flex-col gap-2 justify-center items-center">
                <LayoutTemplateIcon strokeWidth={1} size={32} />
                <div className="font-inter text-base mb-3">
                  No templates defined
                </div>
              </div>
            </div>
          )}
          {templates.length > 0 && (
            <ScrollArea className="w-full h-full overflow-auto">
              <div
                className="w-full grid grid-cols-3 gap-5 p-5"
                onDragStart={(e) => {
                  if (e.target instanceof HTMLImageElement) {
                    window.weaveDragTemplateData = {
                      templateData: e.target.dataset.templateData,
                    };
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
        <DialogDescription className="font-inter text-sm my-0">
          Define a name for the frame
        </DialogDescription>
        <div className="grid grid-cols-1 gap-5">
          <div className="flex flex-col justify-start items-start gap-0">
            <Label className="mb-2">Frame name</Label>
            <Input
              type="text"
              className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
              value={frameName}
              onChange={(e) => {
                setFrameName(e.target.value);
              }}
              onFocus={() => {
                window.weaveOnFieldFocus = true;
              }}
              onBlurCapture={() => {
                window.weaveOnFieldFocus = false;
              }}
            />
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
            disabled={!template || frameName.trim() === ""}
            className="cursor-pointer font-inter rounded-none"
            onClick={() => {
              setStep("confirm");
            }}
          >
            CONTINUE
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
