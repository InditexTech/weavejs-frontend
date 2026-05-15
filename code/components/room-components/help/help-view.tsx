// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Eye, MapPinned, MousePointer } from "lucide-react";
import { HelpShortcutElement } from "./help-shortcut-element";
import { formatForDisplay } from "@tanstack/react-hotkeys";

export const HelpView = () => {
  return (
    <div className="w-full grid grid-cols-2 py-3 gap-x-5">
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<Eye />}
          label="Show/Hide UI / Zen mode"
          shortcuts={formatForDisplay("Mod+\\")}
        />
        <HelpShortcutElement
          icon={<MapPinned />}
          label="Show/Hide Minimap"
          shortcuts={formatForDisplay("N")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<MousePointer />}
          label="Users cursors"
          shortcuts={formatForDisplay("Alt+Mod+U")}
        />
      </div>
    </div>
  );
};
