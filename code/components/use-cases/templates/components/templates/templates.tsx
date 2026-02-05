// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useTemplatesUseCase } from "../../store/store";
import { getTemplates } from "@/api/get-templates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateEntity } from "./types";
import { Template } from "./template";
import { CogIcon, LayoutTemplateIcon } from "lucide-react";

const TEMPLATES_LIMIT = 20;

export const Templates = () => {
  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const templatesManage = useTemplatesUseCase(
    (state) => state.templates.manage,
  );

  const [selectedTemplates, setSelectedTemplates] = React.useState<
    TemplateEntity[]
  >([]);
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
    enabled: templatesManage,
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

  const handleCheckboxChange = React.useCallback(
    (checked: boolean, template: TemplateEntity) => {
      let newSelectedTemplates = [...selectedTemplates];
      if (checked) {
        newSelectedTemplates.push(template);
      } else {
        newSelectedTemplates = newSelectedTemplates.filter(
          (actTemplate) => actTemplate !== template,
        );
      }
      const unique = [...new Set(newSelectedTemplates)];
      setSelectedTemplates(unique);
    },
    [selectedTemplates],
  );

  if (!templatesManage) {
    return null;
  }

  return (
    <div className="w-full h-full">
      {templates.length === 0 && (
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-full p-5 flex flex-col gap-2 justify-center items-center">
            <LayoutTemplateIcon strokeWidth={1} size={32} />
            <div className="font-inter text-base mb-3">
              No templates defined
            </div>
            <button
              className="bg-black text-white font-inter text-sm p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-gray-800"
              onClick={() => {
                const host =
                  window.location.protocol + "//" + window.location.host;
                window.open(
                  `${host}/rooms/${instanceId}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              MANAGE TEMPLATES <CogIcon size={20} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}
      {templates.length > 0 && (
        <ScrollArea className="w-full h-[calc(100dvh-65px)] overflow-auto">
          <div
            className="w-full p-5 grid grid-cols-4 gap-5"
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
                const isChecked = selectedTemplates.includes(template);

                const templateComponent = (
                  <Template key={template.templateId} template={template} />
                );

                return (
                  <div
                    key={template.templateId}
                    className="w-full"
                    onClick={() => {
                      handleCheckboxChange(!isChecked, template);
                    }}
                  >
                    <div className="group relative w-full">
                      {templateComponent}
                    </div>
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
      )}
    </div>
  );
};
