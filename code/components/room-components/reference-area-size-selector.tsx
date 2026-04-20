// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { ExportAreaReferenceSize } from "../plugins/export-area-reference/types";
import { useWeave } from "@inditextech/weave-react";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "../plugins/export-area-reference/constants";
import { ExportAreaReferencePlugin } from "../plugins/export-area-reference/export-area-reference";

export const EXPORT_AREA_SIZES: Record<string, ExportAreaReferenceSize> = {
  "1K": { width: 1920, height: 1080 },
  "2K": { width: 2560, height: 1440 },
  "4K": { width: 3840, height: 2160 },
  "8K": { width: 7680, height: 4320 },
} as const;

export const ReferenceAreaSizeSelector = () => {
  const instance = useWeave((state) => state.instance);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const selectedSize = useCollaborationRoom(
    (state) => state.referenceArea.size,
  );
  const setReferenceAreaSize = useCollaborationRoom(
    (state) => state.setReferenceAreaSize,
  );

  const sizes = React.useMemo(() => {
    return Object.entries(EXPORT_AREA_SIZES).map(([key, value]) => ({
      label: `${value.width} x ${value.height} (${key})`,
      value: key,
    }));
  }, []);

  const selectedSizeElement = React.useMemo(() => {
    const size = EXPORT_AREA_SIZES[selectedSize];
    return {
      label: `${size.width} x ${size.height} (${selectedSize})`,
      value: selectedSize,
    };
  }, [selectedSize]);

  return (
    <DropdownMenu
      onOpenChange={(open: boolean) => setMenuOpen(open)}
      open={menuOpen}
      modal={false}
    >
      <DropdownMenuTrigger
        className={cn(
          "flex gap-2 rounded-none h-[32px] font-inter font-light text-sm hover:text-[#c9c9c9] justify-start items-center uppercase cursor-pointer focus:outline-none",
          {
            ["font-light text-[#c9c9c9]"]: menuOpen,
            ["font-light"]: !menuOpen,
          },
        )}
      >
        <span>{selectedSizeElement.label}</span>
        {menuOpen ? (
          <ChevronUp size={20} strokeWidth={1} />
        ) : (
          <ChevronDown size={20} strokeWidth={1} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        alignOffset={0}
        sideOffset={9}
        className="font-inter rounded-none"
      >
        <DropdownMenuGroup>
          {sizes.map((size) => {
            return (
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);

                  if (!instance) return;

                  const exportAreaReferencePlugin =
                    instance.getPlugin<ExportAreaReferencePlugin>(
                      EXPORT_AREA_REFERENCE_PLUGIN_KEY,
                    );

                  if (!exportAreaReferencePlugin) return;

                  exportAreaReferencePlugin.changeSize(size.value);

                  setReferenceAreaSize(size.value);
                }}
              >
                {size.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
