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
import { useExportFramesToPDFServerSide } from "../hooks/use-export-frames-to-pdf-server-side";
import { FrameImage } from "../frames-library/frames-library.image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

type ExportFramesToPdfConfigDialogProps = {
  onIsExportingChange?: (isExporting: boolean) => void;
};

export function ExportFramesToPDFConfigDialog({
  onIsExportingChange,
}: ExportFramesToPdfConfigDialogProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const [padding, setPadding] = React.useState<string>("0");
  const [pixelRatio, setPixelRatio] = React.useState<string>("1");

  const framesImages = useCollaborationRoom((state) => state.frames.images);
  const pdfPages = useCollaborationRoom((state) => state.frames.pages);
  const exportFrameConfigVisible = useCollaborationRoom(
    (state) => state.frames.export.visible,
  );
  const setFramesExportVisible = useCollaborationRoom(
    (state) => state.setFramesExportVisible,
  );

  React.useEffect(() => {
    if (exportFrameConfigVisible) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
    }
  }, [exportFrameConfigVisible]);

  const { handleExportFramesToPDFServerSide, isExporting } =
    useExportFramesToPDFServerSide();

  React.useEffect(() => {
    onIsExportingChange?.(isExporting);
  }, [isExporting, onIsExportingChange]);

  const handleExport = React.useCallback(() => {
    handleExportFramesToPDFServerSide({
      pages: pdfPages,
      padding: safeParseInt(padding, 0),
      pixelRatio: safeParseInt(pixelRatio, 1),
    });
    setFramesExportVisible(false);
  }, [
    padding,
    pixelRatio,
    pdfPages,
    handleExportFramesToPDFServerSide,
    setFramesExportVisible,
  ]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!exportFrameConfigVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleExport();
      }
    },
    [exportFrameConfigVisible, handleExport],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={exportFrameConfigVisible}
      onOpenChange={(open) => setFramesExportVisible(open)}
    >
      <form>
        <DialogContent className="sm:max-w-[640px] gap-6 top-5 translate-y-0">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Export Frames
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setFramesExportVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
            <DialogDescription className="font-inter text-sm mt-5">
              Export the selected frames to a PDF. Define the padding and pixel
              ratio for the export.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
          <div className="font-light text-sm">
            Selected frames [{pdfPages.length}]
          </div>
          <ScrollArea className="w-full overflow-x-auto whitespace-nowrap border-[0.5px] border-[#c9c9c9] rounded-xl">
            <div className="w-full flex justify-start gap-0 items-center">
              {pdfPages.map((page, index) => {
                const image =
                  framesImages[page.nodes[0].replace("-group-internal", "")];

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col gap-1 justify-start items-start m-3 ml-0",
                      { ["ml-3"]: index === 0 },
                    )}
                  >
                    {image && (
                      <FrameImage
                        image={image}
                        title={`${index + 1}. ${page.title}`}
                        className="w-[351px]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <ScrollBar className="hidden" orientation="horizontal" />
          </ScrollArea>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
          <div className="grid gap-1">
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
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
          <DialogFooter>
            <Button
              ref={buttonRef}
              type="button"
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
