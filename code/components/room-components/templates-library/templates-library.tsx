// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { SquareCheck, SquareX, Trash2 } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { TemplatesLibraryActions } from "./templates-library.actions";
import { getTemplates } from "@/api/get-templates";
import { Template } from "./template";
import { delTemplate } from "@/api/del-template";
import { TemplateEntity } from "./types";
import Konva from "konva";
import { setTemplateOnPosition } from "@/components/utils/templates";
import { SidebarHeader } from "../sidebar-header";
// import { eventBus } from "@/components/utils/events-bus";

const TEMPLATES_LIMIT = 20;

export const TemplatesLibrary = () => {
  const instance = useWeave((state) => state.instance);

  const [selectedTemplates, setSelectedTemplates] = React.useState<
    TemplateEntity[]
  >([]);
  const [templates, setTemplates] = React.useState<TemplateEntity[]>([]);
  const [showSelection, setShowSelection] = React.useState<boolean>(false);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);

  const mutationDelete = useMutation({
    mutationFn: async (templateId: string) => {
      return await delTemplate(
        user?.name ?? "",
        clientId ?? "",
        room ?? "",
        templateId
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting template deletion...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting images deletion.");
    },
  });

  const handleDeleteTemplate = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (template: any) => {
      if (!instance) {
        return;
      }

      mutationDelete.mutate(template.templateId);
    },
    [instance, mutationDelete]
  );

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleTemplateStageDrop(e: any) {
      if (!instance) {
        return;
      }

      if (window.weaveDragTemplateData) {
        instance.getStage().setPointersPositions(e);
        const position: Konva.Vector2d | null | undefined = instance
          .getStage()
          .getPointerPosition();
        // getPositionRelativeToContainerOnPosition(instance);

        if (!position) {
          return;
        }

        const { mousePoint } = instance.getMousePointer(position);

        setTemplateOnPosition(
          instance,
          window.weaveDragTemplateData
            ? JSON.parse(window.weaveDragTemplateData.templateData)
            : {},
          mousePoint
        );

        window.weaveDragTemplateData = undefined;
      }
    }

    instance.addEventListener("onStageDrop", handleTemplateStageDrop);

    return () => {
      instance.removeEventListener("onStageDrop", handleTemplateStageDrop);
    };
  }, [instance]);

  const query = useInfiniteQuery({
    queryKey: ["getTemplates", room],
    queryFn: async ({ pageParam }) => {
      if (!room) {
        return [];
      }

      return await getTemplates(
        room ?? "",
        pageParam as number,
        TEMPLATES_LIMIT
      );
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedSoFar = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0
      );
      if (loadedSoFar < lastPage.total) {
        return loadedSoFar; // next offset
      }
      return undefined; // no more pages
    },
    enabled: sidebarActive === "templates",
  });

  React.useEffect(() => {
    if (!query.data) return;
    setTemplates((prev: TemplateEntity[]) =>
      (query.data?.pages.flatMap((page) => page.items) ?? []).map(
        (newItem: TemplateEntity) =>
          prev.find(
            (oldItem) =>
              oldItem.templateId === newItem.templateId &&
              oldItem.updatedAt === newItem.updatedAt
          ) || newItem
      )
    );
  }, [query.data]);

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  const realSelectedImages = React.useMemo(() => {
    return selectedTemplates.filter((template) => templates.includes(template));
  }, [selectedTemplates, templates]);

  const handleCheckNone = React.useCallback(() => {
    setSelectedTemplates([]);
  }, []);

  const handleCheckAll = React.useCallback(() => {
    const newSelectedTemplates = [];

    for (const template of templates) {
      newSelectedTemplates.push(template);
    }

    setSelectedTemplates(newSelectedTemplates);
  }, [templates]);

  const handleCheckboxChange = React.useCallback(
    (checked: boolean, template: TemplateEntity) => {
      let newSelectedTemplates = [...selectedTemplates];
      if (checked) {
        newSelectedTemplates.push(template);
      } else {
        newSelectedTemplates = newSelectedTemplates.filter(
          (actTemplate) => actTemplate !== template
        );
      }
      const unique = [...new Set(newSelectedTemplates)];
      setSelectedTemplates(unique);
    },
    [selectedTemplates]
  );

  if (!instance) {
    return null;
  }

  if (sidebarActive !== SIDEBAR_ELEMENTS.templates) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <SidebarHeader
        actions={
          <div className="flex justify-end items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="selection-mode"
                checked={showSelection}
                onCheckedChange={(checked) => {
                  setShowSelection(checked);
                }}
                className="w-[32px] cursor-pointer"
              />
              <Label
                htmlFor="selection-mode"
                className="!font-inter !text-xs cursor-pointer"
              >
                SELECTION
              </Label>
            </div>
          </div>
        }
      >
        <SidebarSelector title="Templates" />
      </SidebarHeader>
      {showSelection && (
        <div className="w-full h-[40px] p-0 px-6 bg-white flex justify-between items-center border-b-[0.5px] border-[#c9c9c9]">
          <div className="flex gap-1 justify-start items-center font-inter font-light text-xs">
            SELECTED{" "}
            <Badge className="font-inter text-xs">
              {realSelectedImages.length}
            </Badge>
          </div>
          <div className="flex gap-2 justify-end items-center">
            <button
              className="cursor-pointer flex gap-1 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
              onClick={() => {
                handleCheckNone();
              }}
            >
              <span>NONE</span> <SquareX size={20} strokeWidth={1} />
            </button>
            <button
              className="cursor-pointer flex gap-1 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
              onClick={() => {
                handleCheckAll();
              }}
            >
              <span>ALL</span>
              <SquareCheck size={20} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}
      <ScrollArea
        className={cn("w-full overflow-auto", {
          ["h-[calc(100%-95px-40px-40px)]"]: showSelection,
          ["h-[calc(100%-95px)]"]: !showSelection,
        })}
      >
        <div
          className="w-full weaveDraggable p-0 py-[24px] pb-0 flex flex-col gap-[24px]"
          onDragStart={(e) => {
            if (e.target instanceof HTMLImageElement) {
              window.weaveDragTemplateData = {
                templateData: e.target.dataset.templateData,
              };
            }
          }}
        >
          {templates.length === 0 && (
            <div className="col-span-1 w-full h-full mt-[24px] px-5 flex flex-col justify-center items-center text-sm text-center font-inter font-light">
              <b className="font-normal text-[18px]">No templates</b>
              <span className="text-[14px]">
                Save a node or a selection of nodes
                <br />
                as a template.
              </span>
            </div>
          )}
          {templates.length > 0 &&
            templates.map((template) => {
              const isChecked = selectedTemplates.includes(template);

              const templateComponent = (
                <Template
                  key={template.templateId}
                  selected={isChecked}
                  showSelection={showSelection}
                  onChange={() => {
                    handleCheckboxChange(!isChecked, template);
                  }}
                  template={template}
                />
              );

              return (
                <div
                  key={template.templateId}
                  className="w-full"
                  onClick={() => {
                    handleCheckboxChange(!isChecked, template);
                  }}
                >
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div className="group relative w-full px-[24px]">
                        {templateComponent}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-52 rounded-none border-0 border-[#c9c9c9] shadow-none">
                      <ContextMenuItem
                        className="rounded-none uppercase font-inter text-xs"
                        onClick={() => {
                          handleDeleteTemplate(template);
                        }}
                      >
                        <Trash2 strokeWidth={1} size={16} className="mr-2" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
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
      {showSelection && (
        <TemplatesLibraryActions selectedTemplates={selectedTemplates} />
      )}
    </div>
  );
};
