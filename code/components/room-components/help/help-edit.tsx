// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  ClipboardPaste,
  Copy,
  ClipboardCopy,
  ImageDown,
  MonitorDown,
  Undo,
  Redo,
} from "lucide-react";
import { HelpShortcutElement } from "./help-shortcut-element";
import { formatForDisplay } from "@tanstack/react-hotkeys";

export const HelpEdit = () => {
  return (
    <div className="w-full grid grid-cols-3 py-3 gap-x-5">
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<ClipboardCopy />}
          label="Copy"
          shortcuts={formatForDisplay("Mod+C")}
        />
        <HelpShortcutElement
          icon={<ClipboardPaste />}
          label="Paste"
          shortcuts={formatForDisplay("Mod+P")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<Copy />}
          label="Duplicate"
          shortcuts={formatForDisplay("Mod+D")}
        />
        <HelpShortcutElement
          icon={<Undo />}
          label="Undo"
          shortcuts={formatForDisplay("Shift+Mod+,")}
        />
        <HelpShortcutElement
          icon={<Redo />}
          label="Redo"
          shortcuts={formatForDisplay("Shift+Mod+.")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<ImageDown />}
          label="Export selected as image"
          shortcuts={formatForDisplay("Shift+Mod+E")}
        />
        <HelpShortcutElement
          icon={<MonitorDown />}
          label="Export viewport as image"
          shortcuts={formatForDisplay("Shift+Mod+V")}
        />
      </div>
    </div>
  );
};
