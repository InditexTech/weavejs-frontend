// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { useIACapabilities } from "@/store/ia";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { WeaveExportNodesActionParams } from "@inditextech/weave-sdk";
import { X } from "lucide-react";
import Konva from "konva";

export function SelectedMaskPopup() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);

  const selectedMask = useIACapabilities((state) => state.mask.selected);
  const setSelectedMasks = useIACapabilities((state) => state.setSelectedMasks);
  const [actualMaskBase64, setActualMaskBase64] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const generateMask = async () => {
      if (!instance) return;

      if (!selectedMask) return;

      const stage = instance.getStage();

      if (!stage) return;

      const mainLayer = instance.getMainLayer();

      if (!mainLayer) return;

      const masks = [];

      if (selectedMask.length === 1) {
        const maskElement = stage.findOne(`#${selectedMask[0]}`);

        if (
          maskElement &&
          maskElement.getAttrs().nodeType === "group" &&
          (maskElement as Konva.Group)
            .getChildren()
            .every(
              (child: Konva.Node) =>
                child.getAttrs().nodeType === "line" && child.getAttrs().closed
            )
        ) {
          for (const child of (maskElement as Konva.Group).getChildren()) {
            child.setAttrs({
              fill: "#67BCF099",
            });

            masks.push(child);
          }
        }

        if (
          maskElement &&
          maskElement.getAttrs().nodeType === "line" &&
          maskElement.getAttrs().closed
        ) {
          maskElement.setAttrs({
            fill: "#67BCF099",
          });

          masks.push(maskElement);
        }
      }
      if (selectedMask.length > 1) {
        for (const mask of selectedMask) {
          const maskElement = stage.findOne(`#${mask}`);

          if (maskElement) {
            maskElement?.setAttrs({
              fill: "#67BCF099",
            });
            masks.push(maskElement);
          }
        }
      }

      if (masks.length === 0) {
        return;
      }

      const image: HTMLImageElement = await instance.triggerAction<
        WeaveExportNodesActionParams,
        Promise<HTMLImageElement>
      >("exportNodesTool", {
        nodes: masks as WeaveElementInstance[],
        triggerSelectionTool: false,
        options: {
          backgroundColor: "#ffffffff",
          padding: 40,
          pixelRatio: 2,
        },
      });

      const base64URL: unknown = instance.imageToBase64(image, "image/png");

      setActualMaskBase64(base64URL as string);
    };

    generateMask();
  }, [instance, selectedMask]);

  if (!selectedMask || !actualMaskBase64) return null;

  return (
    <>
      <div className="absolute bottom-[16px] left-[16px]">
        <div className="w-full flex flex-col justify-center items-center bg-white border border-[#c9c9c9]">
          <div className="w-full flex justify-between items-center border-b border-[#c9c9c9] uppercase">
            <div className="font-inter text-lg px-4">Selected mask</div>
            <button
              className="cursor-pointer hover:text-[#666666]"
              onClick={() => {
                setSelectedMasks([]);
              }}
            >
              <X className="px-2" size={40} strokeWidth={1} />
            </button>
          </div>
          <div className="max-w-[300px] max-h-[300px] min-w-[300px] min-h-[300px] h-full bg-white aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={actualMaskBase64}
              src={actualMaskBase64}
              alt="Actual selected mask"
              className="w-full h-full bg-transparent object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
}
