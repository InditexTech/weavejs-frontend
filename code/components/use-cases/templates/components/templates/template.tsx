// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { TemplateEntity } from "./types";
import { useAmountSlotsTemplate } from "../../hooks/use-amount-slots-template";
import { Badge } from "@/components/ui/badge";

type TemplateProps = {
  template: TemplateEntity;
};

export const Template = ({ template }: Readonly<TemplateProps>) => {
  const amountOfImageTemplates = useAmountSlotsTemplate({ template });

  return (
    <div
      key={template.templateId}
      className="block relative flex flex-col gap-0 w-full rounded-lg object-cover bg-white relative border-[0.5px] border-[#c9c9c9] overflow-hidden"
    >
      <img
        className="bg-[#d6d6d6] w-full aspect-video block object-contain relative"
        src={template.templateImage}
        alt="A template"
        data-template-data={template.templateData}
      />
      <div className="absolute bottom-3 left-3 rounded-md bg-white w-auto max-w[calc(100%-24px)] flex px-3 py-2 justify-between items-center gap-3 border-t border-[#c9c9c9]">
        <div className="font-light text-base truncate">{template.name}</div>
      </div>
      <div className="absolute top-3 left-3 flex justify-start items-center gap-3">
        <Badge className="font-light">
          {amountOfImageTemplates} slot(s) available
        </Badge>
      </div>
      {template.removalJobId !== null &&
        template.removalStatus !== null &&
        ["pending", "working"].includes(template.removalStatus) && (
          <div className="pulseOverlay"></div>
        )}
    </div>
  );
};
