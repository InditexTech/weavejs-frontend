// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Eye, MousePointer } from "lucide-react";
import { SYSTEM_OS } from "@/lib/utils";
import { HelpShortcutElement } from "./help-shortcut-element";

export const HelpView = () => {
  return (
    <div className="w-full grid grid-cols-2 py-3 gap-x-5">
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<Eye />}
          label="Show/Hide UI / Zen mode"
          shortcuts={{
            [SYSTEM_OS.MAC]: "⌘ \\",
            [SYSTEM_OS.OTHER]: "Ctrl \\",
          }}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<MousePointer />}
          label="Users cursors"
          shortcuts={{
            [SYSTEM_OS.MAC]: "⌥ ⌘ U",
            [SYSTEM_OS.OTHER]: "Alt Ctrl U",
          }}
        />
      </div>
    </div>
  );
};
