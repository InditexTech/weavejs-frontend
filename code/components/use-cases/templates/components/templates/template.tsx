// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @next/next/no-img-element */

"use client";

import React from "react";
import { TemplateEntity } from "./types";
import { useAmountSlotsTemplate } from "../../hooks/use-amount-slots-template";

type TemplateProps = {
  template: TemplateEntity;
};

export const Template = ({ template }: Readonly<TemplateProps>) => {
  const amountOfImageTemplates = useAmountSlotsTemplate({ template });

  return (
    <div
      key={template.templateId}
      className="block flex flex-col gap-0 w-full object-cover bg-white relative border border-[#c9c9c9] overflow-hidden"
    >
      <img
        className="bg-[#d6d6d6] w-full aspect-video block object-contain relative"
        src={template.templateImage}
        alt="A template"
        data-template-data={template.templateData}
      />
      <div className="w-full flex p-3 justify-between items-center gap-3 border-t border-[#c9c9c9]">
        <div className="font-inter text-base truncate">{template.name}</div>
        <div className="font-inter text-xs truncate text-muted-foreground uppercase">
          {amountOfImageTemplates} slots available
        </div>
      </div>
      {template.removalJobId !== null &&
        template.removalStatus !== null &&
        ["pending", "working"].includes(template.removalStatus) && (
          <div className="pulseOverlay"></div>
        )}
    </div>
  );
};
