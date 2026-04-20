// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ToolbarButton } from "./toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { X } from "lucide-react";
import { Divider } from "./overlay/divider";

type SidebarHeaderProps = {
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export const SidebarHeader = ({
  children,
  actions,
}: Readonly<SidebarHeaderProps>) => {
  const viewType = useCollaborationRoom((state) => state.viewType);
  const setShowRightSidebarFloating = useCollaborationRoom(
    (state) => state.setShowRightSidebarFloating,
  );

  return (
    <div className="w-full px-[24px] py-[12px] bg-white flex justify-between items-center border-b-[0.5px] border-[#c9c9c9]">
      <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
        {children}
      </div>
      {actions && (
        <div className="flex justify-end items-center gap-3">
          {actions}
          {viewType === "floating" && (
            <>
              <Divider className="h-[20px]" />
              <ToolbarButton
                icon={<X strokeWidth={1} />}
                onClick={() => {
                  setShowRightSidebarFloating(false);
                }}
                size="small"
                variant="squared"
                tooltipSideOffset={4}
                tooltipSide="top"
                tooltipAlign="start"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
