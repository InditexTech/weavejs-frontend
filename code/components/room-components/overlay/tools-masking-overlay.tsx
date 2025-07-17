// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Eraser, CircleSlash2, SprayCan, X } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { rightElementVariants } from "./variants";
import { SYSTEM_OS } from "@/lib/utils";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { ShortcutElement } from "../help/shortcut-element";
import { useIACapabilities } from "@/store/ia";
import { MoveToolTrigger } from "./tools-triggers/move-tool";

export function ToolsMaskingOverlay() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const actualAction = useWeave((state) => state.actions.actual);

  const imagesLLMPopupType = useIACapabilities((state) => state.llmPopup.type);
  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );

  const aiEnabled = useIACapabilities((state) => state.enabled);

  const triggerTool = React.useCallback(
    (toolName: string, params?: unknown) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName, params);
        return;
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
        return;
      }
    },
    [instance, actualAction]
  );

  const cancelTool = React.useCallback(
    (toolName: string) => {
      if (!instance) return;

      instance.cancelAction(toolName);
    },
    [instance]
  );

  if (imagesLLMPopupVisible && imagesLLMPopupType !== "edit-mask") {
    return;
  }

  if (imagesLLMPopupVisible && imagesLLMPopupType === "edit-mask") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={rightElementVariants}
        className="pointer-events-none absolute top-[16px] right-[16px] bottom-[16px] flex flex-col gap-2 justify-center items-center"
      >
        <Toolbar orientation="vertical">
          {!actualAction && (
            <React.Fragment>
              <ToolbarButton
                className="rounded-full !w-[40px]"
                icon={<SprayCan className="px-2" size={40} strokeWidth={1} />}
                active={actualAction === "fuzzyMaskTool"}
                disabled={
                  !aiEnabled ||
                  weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={() => {
                  triggerTool("fuzzyMaskTool");
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Free Hand Mask tool</p>
                    <ShortcutElement
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "Q",
                        [SYSTEM_OS.OTHER]: "Q",
                      }}
                    />
                  </div>
                }
                tooltipSide="left"
                tooltipAlign="center"
              />
              <ToolbarButton
                className="rounded-full !w-[40px]"
                icon={
                  <CircleSlash2 className="px-2" size={40} strokeWidth={1} />
                }
                active={actualAction === "maskTool"}
                disabled={
                  !aiEnabled ||
                  weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={() => {
                  triggerTool("maskTool");
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Regular Mask tool</p>
                    <ShortcutElement
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "W",
                        [SYSTEM_OS.OTHER]: "W",
                      }}
                    />
                  </div>
                }
                tooltipSide="left"
                tooltipAlign="center"
              />
              <ToolbarDivider orientation="horizontal" />
              <MoveToolTrigger tooltipSide="left" tooltipAlign="center" />
              <ToolbarButton
                className="rounded-full !w-[40px]"
                icon={<Eraser className="px-2" size={40} strokeWidth={1} />}
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                active={actualAction === "maskEraserTool"}
                onClick={() => triggerTool("maskEraserTool")}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Erase Mask tool</p>
                  </div>
                }
                tooltipSide="left"
                tooltipAlign="center"
              />
            </React.Fragment>
          )}
          {actualAction &&
            [
              "moveTool",
              "maskEraserTool",
              "maskTool",
              "fuzzyMaskTool",
            ].includes(actualAction) && (
              <ToolbarButton
                className="rounded-full !w-[40px]"
                icon={<X className="px-2" size={40} strokeWidth={1} />}
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={() => cancelTool(actualAction)}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Cancel</p>
                  </div>
                }
                tooltipSide="left"
                tooltipAlign="center"
              />
            )}
        </Toolbar>
      </motion.div>
    );
  }
}
