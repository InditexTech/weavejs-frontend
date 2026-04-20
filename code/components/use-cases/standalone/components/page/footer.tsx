// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useStandaloneUseCase } from "../../store/store";
import { ZoomToolbar } from "../toolbars/zoom.toolbar";
import { Divider } from "@/components/room-components/overlay/divider";
import { SetupToolbar } from "../toolbars/setup.toolbar";
import { UIToolbar } from "../toolbars/ui.toolbar";
import { ExportToolbar } from "../toolbars/export.toolbar";

export const Footer = () => {
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );

  return (
    <div className="absolute left-0 right-0 bottom-0 w-[calc(100%)] h-[40px] border-t-[0.5px] border-[#c9c9c9] flex justify-between gap-5 items-center px-[24px]">
      <div className="flex justify-start items-center gap-3">
        <Badge
          variant="outline"
          className="cursor-pointer ml-1 font-inter text-xs"
        >
          {managingImageId}
        </Badge>
      </div>
      <div className="flex justify-end items-center gap-3">
        <SetupToolbar />
        <Divider className="h-[20px]" />
        <ExportToolbar />
        <Divider className="h-[20px]" />
        <ZoomToolbar />
        <Divider className="h-[20px]" />
        <UIToolbar />
      </div>
    </div>
  );
};
