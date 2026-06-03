// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { TemplateEntity } from "./types";
import { cn } from "@/lib/utils";
import { delTemplate } from "@/api/del-template";
import { useGetSession } from "../hooks/use-get-session";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TemplatesLibraryActions = {
  selectedTemplates: TemplateEntity[];
  kind: "template" | "imageTemplate" | "all";
  setKind: (kind: "template" | "imageTemplate" | "all") => void;
};

export const TemplatesLibraryActions = ({
  selectedTemplates,
  kind,
  setKind,
}: Readonly<TemplatesLibraryActions>) => {
  const instance = useWeave((state) => state.instance);

  const { session } = useGetSession();

  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);

  const mutationDelete = useMutation({
    mutationFn: async (templateId: string) => {
      return await delTemplate(
        session?.user.id ?? "",
        clientId ?? "",
        room ?? "",
        templateId,
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting templates deletion...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting templates deletion.");
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
    [instance, mutationDelete],
  );

  const actions = React.useMemo(() => {
    const selectionActions = [];

    if (selectedTemplates.length > 0) {
      selectionActions.push(
        <button
          key="delete-selected"
          className="cursor-pointer flex gap-2 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
          onClick={() => {
            for (const template of selectedTemplates) {
              handleDeleteTemplate(template);
            }
          }}
        >
          <Trash strokeWidth={1} size={16} stroke="red" />
        </button>,
      );
    }

    return selectionActions;
  }, [handleDeleteTemplate, selectedTemplates]);

  if (!instance) {
    return null;
  }

  return (
    <div className="w-full h-[52px] p-3 px-6 bg-white flex justify-between items-center border-t-[0.5px] border-[#c9c9c9]">
      <div
        className={cn("flex gap-2 items-center font-inter font-light text-xs", {
          ["justify-start"]: actions.length > 0,
          ["w-full justify-start"]: actions.length === 0,
        })}
      >
        <Select
          value={kind}
          onValueChange={(value) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setKind(value as any);
          }}
        >
          <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
            <SelectValue placeholder="Kind" />
          </SelectTrigger>
          <SelectContent
            className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
            align="start"
          >
            <SelectGroup>
              <SelectItem
                value="all"
                className="font-inter text-xs rounded-none"
              >
                ALL
              </SelectItem>
              <SelectItem
                value="template"
                className="font-inter text-xs rounded-none"
              >
                TEMPLATE
              </SelectItem>
              <SelectItem
                value="imageTemplate"
                className="font-inter text-xs rounded-none"
              >
                IMAGE TEMPLATE
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end items-center">{actions}</div>
    </div>
  );
};
