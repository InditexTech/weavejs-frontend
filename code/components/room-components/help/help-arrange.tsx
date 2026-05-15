// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  BringToFront,
  ArrowUp,
  ArrowDown,
  SendToBack,
  Group,
  Ungroup,
} from "lucide-react";
import { HelpShortcutElement } from "./help-shortcut-element";
import { formatForDisplay } from "@tanstack/react-hotkeys";

export const HelpArrange = () => {
  return (
    <div className="w-full grid grid-cols-2 py-3 gap-x-5">
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<BringToFront />}
          label="Bring to front"
          shortcuts={formatForDisplay("]")}
        />
        <HelpShortcutElement
          icon={<ArrowUp />}
          label="Move up"
          shortcuts={formatForDisplay("Mod+]")}
        />
        <HelpShortcutElement
          icon={<ArrowDown />}
          label="Move down"
          shortcuts={formatForDisplay("Mod+[")}
        />
        <HelpShortcutElement
          icon={<SendToBack />}
          label="Send to back"
          shortcuts={formatForDisplay("[")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<Group />}
          label="Group selected elements"
          shortcuts={formatForDisplay("Shift+Mod+G]")}
        />
        <HelpShortcutElement
          icon={<Ungroup />}
          label="Un-group selected elements"
          shortcuts={formatForDisplay("Shift+Mod+U]")}
        />
      </div>
    </div>
  );
};
