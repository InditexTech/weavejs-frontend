// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { BringToFront, ArrowUp, ArrowDown, SendToBack } from "lucide-react";
import React from "react";
import { ShortcutElement } from "../../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";
import { WeaveElementInstance } from "@inditextech/weave-types";

export const useNodeLayeringTool = () => {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);

  const NODE_LAYERING_TOOL: Record<
    string,
    {
      icon: React.JSX.Element;
      label: React.JSX.Element;
      onClick: () => void;
      active: () => boolean;
    }
  > = React.useMemo(
    () => ({
      bringToFront: {
        icon: <BringToFront className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Bring to front</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "]",
                [SYSTEM_OS.OTHER]: "]",
              }}
            />
          </div>
        ),
        onClick: () => {
          if (!instance) {
            return;
          }

          const nodeInstance = instance.getStage().findOne(`#${node?.key}`);

          if (!nodeInstance) {
            return;
          }

          instance.bringToFront(nodeInstance as WeaveElementInstance);
        },
        active: () => false,
      },
      moveUp: {
        icon: <ArrowUp className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Move up</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "⌘ ]",
                [SYSTEM_OS.OTHER]: "Ctrl ]",
              }}
            />
          </div>
        ),
        onClick: () => {
          if (!instance) {
            return;
          }

          const nodeInstance = instance.getStage().findOne(`#${node?.key}`);

          if (!nodeInstance) {
            return;
          }

          instance.moveUp(nodeInstance as WeaveElementInstance);
        },
        active: () => false,
      },
      moveDown: {
        icon: <ArrowDown className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Move down</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "⌘ [",
                [SYSTEM_OS.OTHER]: "Ctrl [",
              }}
            />
          </div>
        ),
        onClick: () => {
          if (!instance) {
            return;
          }

          const nodeInstance = instance.getStage().findOne(`#${node?.key}`);

          if (!nodeInstance) {
            return;
          }

          instance.moveDown(nodeInstance as WeaveElementInstance);
        },
        active: () => false,
      },
      bringToBack: {
        icon: <SendToBack className="px-2" size={40} strokeWidth={1} />,
        label: (
          <div className="flex gap-3 justify-start items-center">
            <p>Send to back</p>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "J",
                [SYSTEM_OS.OTHER]: "J",
              }}
            />
          </div>
        ),
        onClick: () => {
          if (!instance) {
            return;
          }

          const nodeInstance = instance.getStage().findOne(`#${node?.key}`);

          if (!nodeInstance) {
            return;
          }

          instance.sendToBack(nodeInstance as WeaveElementInstance);
        },
        active: () => false,
      },
    }),
    [instance, node]
  );

  return NODE_LAYERING_TOOL;
};
