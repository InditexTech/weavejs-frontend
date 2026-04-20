// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { Input } from "@/components/ui/input";
import { useWeave } from "@inditextech/weave-react";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import { useExportRoomToPDFServerSide } from "../hooks/use-export-room-to-pdf-server-side";
import { useQuery } from "@tanstack/react-query";
import { getPages } from "@/api/pages/get-pages";

function safeParseInt(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Math.floor(value); // ya es número, forzamos a entero
  }
  if (typeof value === "string") {
    const n = parseInt(value, 10); // siempre base 10
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

type ExportRoomToPdfConfigDialogProps = {
  onIsExportingChange?: (isExporting: boolean) => void;
};

export function ExportRoomToPdfConfigDialog({
  onIsExportingChange,
}: ExportRoomToPdfConfigDialogProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const [padding, setPadding] = React.useState<string>("0");
  const [pixelRatio, setPixelRatio] = React.useState<string>("1");

  const instance = useWeave((state) => state.instance);

  const roomId = useCollaborationRoom((state) => state.room);
  const exportConfigVisible = useCollaborationRoom(
    (state) => state.export.room.pdf.visible,
  );
  const exporting = useCollaborationRoom((state) => state.images.exporting);
  const setExportConfigVisible = useCollaborationRoom(
    (state) => state.setExportRoomToPdfConfigVisible,
  );

  React.useEffect(() => {
    if (exportConfigVisible) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
    }
  }, [exportConfigVisible]);

  const { handleExportRoomToPDFServerSide, isExporting } =
    useExportRoomToPDFServerSide();

  const { data: roomPages, isFetched: pagesIsFetched } = useQuery({
    queryKey: ["getPages", roomId ?? ""],
    queryFn: () => {
      return getPages(roomId ?? "", "active", 0, 5);
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!roomId,
  });

  React.useEffect(() => {
    onIsExportingChange?.(isExporting);
  }, [isExporting, onIsExportingChange]);

  const handleExport = React.useCallback(() => {
    if (!instance) {
      return;
    }

    const exportAreaReferencePlugin =
      instance.getPlugin<ExportAreaReferencePlugin>(
        EXPORT_AREA_REFERENCE_PLUGIN_KEY,
      );

    if (!exportAreaReferencePlugin) {
      return;
    }

    const stage = instance.getStage();
    const exportRect = exportAreaReferencePlugin.getExportRect({
      relativeTo: stage,
    });

    handleExportRoomToPDFServerSide({
      type: "area",
      area: exportRect,
      padding: safeParseInt(padding, 0),
      pixelRatio: safeParseInt(pixelRatio, 1),
    });

    setExportConfigVisible(false);
  }, [
    instance,
    padding,
    pixelRatio,
    handleExportRoomToPDFServerSide,
    setExportConfigVisible,
  ]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!exportConfigVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleExport();
      }
    },
    [exportConfigVisible, handleExport],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={exportConfigVisible}
      onOpenChange={(open) => setExportConfigVisible(open)}
    >
      <form>
        <DialogContent className="sm:max-w-[640px] gap-6 top-5 translate-y-0">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Export room
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setExportConfigVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>

          <DialogDescription>
            Export the room as a PDF. Each page will be a page of the room in
            the actual order. Define the padding, background color and pixel
            ratio for the exported page.
          </DialogDescription>
          <div className="grid grgrid-rows-[auto] gap-5">
            <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-start items-center inter text-sm">
                Pages
              </div>
              <div className="w-full flex justify-end items-center inter text-sm text-right">
                {pagesIsFetched ? (roomPages?.total ?? "-") : "-"}
              </div>
              <div className="flex justify-start items-center inter text-sm">
                Format
              </div>
              <div className="w-full flex justify-end items-center inter text-sm text-right">
                A4
              </div>
            </div>
            <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
            <div className="flex flex-col justify-center items-right gap-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-start items-center inter text-sm">
                  Padding (px)
                </div>
                <div className="flex justify-end items-center">
                  <Input
                    className="w-[100px] font-inter !py-1 !pt-[2px] text-right text-xs rounded-none !h-[30px] !border-black !shadow-none"
                    value={padding}
                    disabled={isExporting}
                    onFocus={() => {
                      window.weaveOnFieldFocus = true;
                    }}
                    onBlurCapture={() => {
                      window.weaveOnFieldFocus = false;
                    }}
                    onChange={(e) => setPadding(e.target.value)}
                    placeholder="Example: 20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-start items-center inter text-sm">
                  Pixel ratio
                </div>
                <div className="flex justify-end items-center">
                  <Select
                    value={pixelRatio}
                    onValueChange={setPixelRatio}
                    disabled={isExporting}
                  >
                    <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                      <SelectValue placeholder="Amount" />
                    </SelectTrigger>
                    <SelectContent
                      className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                      align="end"
                    >
                      <SelectGroup>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (ratio) => (
                            <SelectItem
                              key={ratio}
                              value={`${ratio}`}
                              className="font-inter text-xs rounded-none"
                            >
                              {`${ratio}`}
                            </SelectItem>
                          ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
          <DialogFooter>
            <Button
              ref={buttonRef}
              type="button"
              disabled={exporting}
              className="cursor-pointer font-inter rounded-none"
              onClick={handleExport}
            >
              EXPORT TO PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
