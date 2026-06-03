// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateEntity } from "../templates-library/types";
import { useAddTemplateToRoom } from "@/store/add-template-to-room";
import { Badge } from "@/components/ui/badge";

type TemplateProps = {
  template: TemplateEntity;
};

export const AddToRoomTemplate = ({ template }: Readonly<TemplateProps>) => {
  const selectedImages = useAddTemplateToRoom((state) => state.images);
  const selectedTemplate = useAddTemplateToRoom((state) => state.template);
  const setStep = useAddTemplateToRoom((state) => state.setStep);
  const setTemplate = useAddTemplateToRoom((state) => state.setTemplate);

  const isSelected = React.useMemo(() => {
    return selectedTemplate?.templateId === template.templateId;
  }, [selectedTemplate, template]);

  if (!template) {
    return null;
  }

  return (
    <div
      key={template.templateId}
      className={cn(
        "group relative flex flex-col border-[0.5px] border-[#c9c9c9] rounded-md gap-0 w-full object-cover bg-white relative overflow-hidden cursor-pointer",
        {
          ["after:absolute after:rounded-md after:border-[4px] after:border-black after:box-border after:content-[''] after:inset-0"]:
            isSelected,
          ["cursor-default bg-[#cc0000]"]:
            selectedImages.length > template.imageSlots,
        },
      )}
      onClick={() => {
        if (isSelected) {
          setTemplate(undefined);
          return;
        }
        if (selectedImages.length <= template.imageSlots) {
          setStep("configuration");
          setTemplate(template);
        }
      }}
    >
      <img
        className={cn(
          "bg-[#d6d6d6] w-full aspect-video block object-contain relative",
          {
            ["opacity-60"]: selectedImages.length > template.imageSlots,
            ["transition-transform duration-500 group-hover:opacity-60"]:
              selectedImages.length <= template.imageSlots,
          },
        )}
        src={template.templateImage}
        alt="A template"
        data-template-data={template.templateData}
      />
      <div className="absolute top-3 right-3">
        <Badge>{template.imageSlots} image slot(s)</Badge>
      </div>
      <div className="text-black px-4 py-3 text-sm font-light text-base border-t-[0.5px] border-[#c9c9c9]">
        {template.name}
      </div>
      {isSelected && (
        <div className="absolute right-3 top-3 bg-black rounded-md text-white p-2">
          <CheckIcon size={16} strokeWidth={1} />
        </div>
      )}
    </div>
  );
};
