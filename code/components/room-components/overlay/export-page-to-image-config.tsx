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
import { Image, X } from "lucide-react";
import { useExportPageToImageServerSide } from "../hooks/use-export-page-to-image-server-side";
import { useCollaborationRoom } from "@/store/store";
import { Input } from "@/components/ui/input";
import { WeaveExportFormats } from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useGetPageThumbnail } from "../hooks/use-get-page-thumbnail";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";

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

type ExportPageToImageConfigDialogProps = {
  onIsExportingChange?: (isExporting: boolean) => void;
};

export function ExportPageToImageConfigDialog({
  onIsExportingChange,
}: ExportPageToImageConfigDialogProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const [format, setFormat] = React.useState<string>("image/png");
  const [padding, setPadding] = React.useState<string>("0");
  const [backgroundColor, setBackgroundColor] =
    React.useState<string>("#FFFFFF");
  const [pixelRatio, setPixelRatio] = React.useState<string>("1");

  const instance = useWeave((state) => state.instance);

  const exportConfigVisible = useCollaborationRoom(
    (state) => state.export.page.image.visible,
  );
  const exporting = useCollaborationRoom((state) => state.images.exporting);
  const setExportConfigVisible = useCollaborationRoom(
    (state) => state.setExportPageToImageConfigVisible,
  );

  React.useEffect(() => {
    if (exportConfigVisible) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
    }
  }, [exportConfigVisible]);

  const { handleExportPageToImageServerSide, isExporting: isExporting } =
    useExportPageToImageServerSide();

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

    handleExportPageToImageServerSide({
      type: "area",
      area: exportRect,
      format: format as WeaveExportFormats,
      padding: safeParseInt(padding, 0),
      backgroundColor: backgroundColor,
      pixelRatio: safeParseInt(pixelRatio, 1),
    });

    setExportConfigVisible(false);
  }, [
    instance,
    format,
    padding,
    backgroundColor,
    pixelRatio,
    handleExportPageToImageServerSide,
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

  const { roomState, generationState, pageThumbnail } = useGetPageThumbnail();

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
                Export page
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
            Export the following page as an image. Define the format, padding,
            background color and pixel ratio for the exported image. The
            thumbnail bellow is a preview of the exported area based on the
            current configuration.
          </DialogDescription>
          <div className="grid grid-rows-[auto_auto_auto] gap-5">
            <div className="aspect-video">
              {(roomState !== "loaded" ||
                (roomState === "loaded" &&
                  generationState !== "generated")) && (
                <div className="object-cover h-full rounded-lg border-[0.5px] border-[#c9c9c9] flex justify-center items-center">
                  <div className="flex flex-col gap-1 justify-center items-center text-sm text-[#757575]">
                    <Image size={20} />
                    loading page thumbnail
                  </div>
                </div>
              )}
              {generationState === "generated" && pageThumbnail && (
                <img
                  src={URL.createObjectURL(pageThumbnail)}
                  className="w-full h-full object-cover rounded-lg border-[0.5px] border-[#c9c9c9]"
                />
              )}
            </div>
            <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
            <div className="flex flex-col justify-center items-right gap-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-start items-center inter text-sm">
                  Format
                </div>
                <div className="flex justify-end items-center">
                  <Select
                    value={format}
                    onValueChange={setFormat}
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
                        <SelectItem
                          value="image/png"
                          className="font-inter text-xs rounded-none"
                        >
                          PNG
                        </SelectItem>
                        <SelectItem
                          value="image/jpeg"
                          className="font-inter text-xs rounded-none"
                        >
                          JPEG
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                  Background color
                </div>
                <div className="flex justify-end items-center">
                  <Select
                    value={backgroundColor}
                    onValueChange={setBackgroundColor}
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
                        <SelectItem
                          value="#FFFFFF"
                          className="font-inter text-xs rounded-none"
                        >
                          White
                        </SelectItem>
                        <SelectItem
                          value="#D3D3D3"
                          className="font-inter text-xs rounded-none"
                        >
                          Gray
                        </SelectItem>
                        <SelectItem
                          value="#000000"
                          className="font-inter text-xs rounded-none"
                        >
                          Black
                        </SelectItem>
                        <SelectItem
                          value="transparent"
                          className="font-inter text-xs rounded-none"
                        >
                          None
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
              disabled={exporting || generationState !== "generated"}
              className="cursor-pointer font-inter rounded-none"
              onClick={handleExport}
            >
              EXPORT TO IMAGE
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
