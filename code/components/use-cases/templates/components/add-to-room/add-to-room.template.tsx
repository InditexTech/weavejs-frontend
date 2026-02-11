// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @next/next/no-img-element */

"use client";

import React from "react";
import { TemplateEntity } from "../templates/types";
import { useAddToRoom } from "../../store/add-to-room";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTemplatesUseCase } from "../../store/store";
import { useAmountSlotsTemplate } from "../../hooks/use-amount-slots-template";

type TemplateProps = {
  template: TemplateEntity;
};

export const AddToRoomTemplate = ({ template }: Readonly<TemplateProps>) => {
  const selectedImages = useTemplatesUseCase((state) => state.images.selected);

  const selectedTemplate = useAddToRoom((state) => state.template);
  const setTemplate = useAddToRoom((state) => state.setTemplate);

  const isSelected = React.useMemo(() => {
    return selectedTemplate?.templateId === template.templateId;
  }, [selectedTemplate, template]);

  const amountOfImageTemplates = useAmountSlotsTemplate({ template });

  return (
    <div
      key={template.templateId}
      className={cn(
        "group block relative flex gap-0 w-full object-cover bg-white relative overflow-hidden cursor-pointer",
        {
          ["after:absolute after:border-[2px] after:border-black after:box-border after:content-[''] after:inset-0"]:
            isSelected,
          ["cursor-default bg-[#cc0000]"]:
            selectedImages.length > amountOfImageTemplates,
        },
      )}
      onClick={() => {
        if (selectedImages.length <= amountOfImageTemplates) {
          setTemplate(template);
        }
      }}
    >
      <img
        className={cn(
          "bg-[#d6d6d6] w-full aspect-video block object-contain relative",
          {
            ["opacity-60"]: selectedImages.length > amountOfImageTemplates,
            ["transition-transform duration-500 group-hover:opacity-60"]:
              selectedImages.length <= amountOfImageTemplates,
          },
        )}
        src={template.templateImage}
        alt="A template"
        data-template-data={template.templateData}
      />
      {isSelected && (
        <div className="absolute right-0 bottom-0 bg-black text-white p-2">
          <CheckIcon size={16} strokeWidth={1} />
        </div>
      )}
    </div>
  );
};
