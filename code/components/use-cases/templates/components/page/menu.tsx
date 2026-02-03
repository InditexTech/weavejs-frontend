// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useWeave } from "@inditextech/weave-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/utils/logo";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTemplatesUseCase } from "../../store/store";

export function Menu() {
  const router = useRouter();

  const instance = useWeave((state) => state.instance);

  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const templatesManage = useTemplatesUseCase(
    (state) => state.templates.manage,
  );
  const setUser = useTemplatesUseCase((state) => state.setUser);
  const setInstanceId = useTemplatesUseCase((state) => state.setInstanceId);
  const setTemplatesManage = useTemplatesUseCase(
    (state) => state.setTemplatesManage,
  );

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleExitRoom = React.useCallback(async () => {
    sessionStorage.removeItem(`weave.js_standalone_templates_${instanceId}`);
    await instance?.getStore().disconnect();
    setMenuOpen(false);
    setUser(undefined);
    setInstanceId("undefined");
    router.push("/use-cases/templates");
  }, [instance, instanceId, router, setInstanceId, setUser]);

  const handleManageTemplates = React.useCallback(() => {
    setTemplatesManage(!templatesManage);
  }, [templatesManage, setTemplatesManage]);

  return (
    <>
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open: boolean) => {
          setMenuOpen(open);
        }}
      >
        <DropdownMenuTrigger
          className={cn("rounded-none cursor-pointer focus:outline-none", {
            ["font-normal"]: menuOpen,
            ["font-extralight"]: !menuOpen,
          })}
        >
          <div className="flex gap-1 justify-start items-center">
            <div className="h-[40px] 2xl:h-[60px] flex justify-start items-center">
              <Logo kind="only-logo" variant="no-text" />
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
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            onPointerDown={handleManageTemplates}
          >
            Manage templates
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none"
            onPointerDown={handleExitRoom}
          >
            Close
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
