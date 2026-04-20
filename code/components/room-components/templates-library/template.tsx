// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useWeave } from "@inditextech/weave-react";
import { TemplateEntity } from "./types";
import { cn } from "@/lib/utils";

type TemplateProps = {
  template: TemplateEntity;
  selected: boolean;
  showSelection: boolean;
  onChange: (checked: string | boolean) => void;
};

export const Template = ({
  template,
  selected,
  showSelection,
  onChange,
}: Readonly<TemplateProps>) => {
  const instance = useWeave((state) => state.instance);

  if (!instance) {
    return null;
  }

  return (
    <div
      key={template.templateId}
      className={cn(
        "group block flex flex-col gap-0 w-full object-cover bg-white relative border border-[#c9c9c9]overflow-hidden",
        {
          ["cursor-pointer"]:
            ["completed"].includes(template.status) &&
            template.removalJobId === null,
        },
      )}
    >
      <img
        className="bg-[#d6d6d6] w-full aspect-video block object-contain relative transition-transform duration-500 group-hover:opacity-60"
        src={template.templateImage}
        alt="A template"
        data-template-data={template.templateData}
      />
      <div className="w-full flex p-3 justify-between items-center gap-3 border-t border-[#c9c9c9]">
        <div className="font-inter text-xs truncate">{template.name}</div>
        {showSelection && (
          <Checkbox
            id="terms"
            className="bg-white rounded-none cursor-pointer"
            value={template.templateId}
            checked={selected}
            onCheckedChange={(checked: boolean) => {
              onChange(checked);
            }}
          />
        )}
      </div>
      {template.removalJobId !== null &&
        template.removalStatus !== null &&
        ["pending", "working"].includes(template.removalStatus) && (
          <div className="pulseOverlay"></div>
        )}
    </div>
  );
};
