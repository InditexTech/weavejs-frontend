// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Trash, Copy, Lock, EyeOff, Group } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { rightElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { WeaveCopyPasteNodesPlugin } from "@inditextech/weave-sdk";
import { ShortcutElement } from "../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";

export function ToolsNodesOverlay() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const nodes = useWeave((state) => state.selection.nodes);

  const showUI = useCollaborationRoom((state) => state.ui.show);

  if (nodes && nodes.length <= 1) return null;

  if (!showUI) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={rightElementVariants}
      className="pointer-events-none absolute right-[16px] top-[16px] bottom-[16px] flex flex-col gap-2 justify-center items-center"
    >
      <Toolbar
        orientation="vertical"
        className="grid grid-cols-1 w-auto justify-start items-center rounded-3xl"
      >
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Group className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={async () => {
            if (!instance) {
              return;
            }

            instance.group(
              nodes
                .map((n) => n?.node)
                .filter((node) => typeof node !== "undefined")
            );
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Group</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⇧ ⌘ G",
                  [SYSTEM_OS.OTHER]: "⇧ Ctrl G",
                }}
              />
            </div>
          }
          tooltipSide="left"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Lock className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            if (!instance) {
              return;
            }

            for (const node of nodes) {
              const isLocked = instance.allNodesLocked([node.instance]);

              if (!isLocked) {
                instance.lockNode(node.instance);
                continue;
              }
              if (isLocked) {
                instance.unlockNode(node.instance);
              }
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Lock</p>
            </div>
          }
          tooltipSide="left"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<EyeOff className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            if (!instance) {
              return;
            }

            for (const node of nodes) {
              const isVisible = instance.allNodesVisible([node.instance]);

              if (!isVisible) {
                instance.showNode(node.instance);
                continue;
              }
              if (isVisible) {
                instance.hideNode(node.instance);
              }
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Hide</p>
            </div>
          }
          tooltipSide="left"
          tooltipAlign="center"
        />
        <ToolbarDivider orientation="horizontal" className="col-span-1" />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Copy className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={async () => {
            if (!instance) {
              return;
            }

            const weaveCopyPasteNodesPlugin =
              instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
            if (weaveCopyPasteNodesPlugin) {
              await weaveCopyPasteNodesPlugin.copy();
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Copy</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⌘ C",
                  [SYSTEM_OS.OTHER]: "Ctrl C",
                }}
              />
            </div>
          }
          tooltipSide="left"
          tooltipAlign="center"
        />
        <ToolbarButton
          className="rounded-full !w-[40px]"
          icon={<Trash className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
          }
          onClick={() => {
            if (!instance) {
              return;
            }

            for (const node of nodes) {
              if (node.node) {
                instance.removeNode(node.node);
              }
            }
          }}
          label={
            <div className="flex gap-3 justify-start items-center">
              <p>Delete</p>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "Del",
                  [SYSTEM_OS.OTHER]: "Del",
                }}
              />
            </div>
          }
          tooltipSide="left"
          tooltipAlign="center"
        />
      </Toolbar>
    </motion.div>
  );
}
