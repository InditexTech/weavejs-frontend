// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useStandaloneUseCase } from "../../store/store";

const SIDEBARS_MAP = {
  comments: "Comments",
  measures: "Measures",
};

export const RightSidebarTitle = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const activeSidebar = useStandaloneUseCase((state) => state.sidebar.active);
  const setActiveSidebar = useStandaloneUseCase(
    (state) => state.setSidebarActive
  );

  return (
    <div className="font-inter text-lg">
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open: boolean) => {
          setMenuOpen(open);
        }}
      >
        <DropdownMenuTrigger className="rounded-none cursor-pointer focus:outline-none">
          <div className="h-[40px] flex gap-1 justify-start items-center">
            <div className="font-inter text-xl flex justify-start items-center">
              {SIDEBARS_MAP[activeSidebar || "comments"]}
            </div>
            {menuOpen ? (
              <ChevronUp size={16} strokeWidth={1} />
            ) : (
              <ChevronDown size={16} strokeWidth={1} />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          align="start"
          side="bottom"
          alignOffset={-12}
          sideOffset={9}
          className="font-inter rounded-none"
        >
          {Object.keys(SIDEBARS_MAP).map((key) => {
            const element = SIDEBARS_MAP[key as keyof typeof SIDEBARS_MAP];
            return (
              <DropdownMenuItem
                key={key}
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                disabled={activeSidebar === key}
                onPointerDown={() => {
                  setActiveSidebar(key as "comments" | "measures");
                }}
              >
                {element}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
