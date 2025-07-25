// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { ColorToken } from "./color-token";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";

type ColorTokenElement = {
  id: string;
  color: string;
};

export const ColorTokensLibrary = () => {
  const instance = useWeave((state) => state.instance);

  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const commonColorTokens: ColorTokenElement[] = React.useMemo(() => {
    return [
      { id: "1", color: "#28282D" },
      { id: "2", color: "#00656B" },
      { id: "3", color: "#D79D00" },
      { id: "4", color: "#3073B7" },
      { id: "5", color: "#953640" },
      { id: "6", color: "#C5AECF" },
      { id: "7", color: "#46295A" },
      { id: "8", color: "#79797C" },
    ];
  }, []);

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.colorTokens) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-[24px] py-[27px] bg-white flex justify-between items-center border-b border-[#c9c9c9]">
        <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
          <SidebarSelector title="Color Tokens" />
        </div>
        <div className="flex justify-end items-center gap-1">
          <button
            className="cursor-pointer bg-transparent hover:bg-accent p-2"
            onClick={() => {
              setSidebarActive(null);
            }}
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
      <ScrollArea className="w-full h-[calc(100%-95px)]">
        <div className="flex flex-col gap-2 w-full h-full p-[24px]">
          <div
            className="grid grid-cols-2 gap-2 w-full weaveDraggable select-none"
            draggable="true"
            onDragStart={(e) => {
              // Safari won't start drag without this!
              e.dataTransfer.setData("text/plain", "dummy");
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.dropEffect = "move";
              if (e.target instanceof HTMLDivElement) {
                window.colorTokenDragColor = e.target.dataset.colortoken;
              }
            }}
          >
            {commonColorTokens.map((ele) => {
              return <ColorToken key={ele.id} color={ele.color} />;
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
