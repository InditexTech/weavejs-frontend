// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Fullscreen, Maximize, ScanEye, ZoomIn, ZoomOut } from "lucide-react";
import { HelpShortcutElement } from "./help-shortcut-element";
import { formatForDisplay } from "@tanstack/react-hotkeys";

export const HelpZoom = () => {
  return (
    <div className="w-full grid grid-cols-2 py-3 gap-x-5">
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<ZoomIn />}
          label="Zoom in"
          shortcuts={formatForDisplay("Mod++")}
        />
        <HelpShortcutElement
          icon={<ZoomOut />}
          label="Zoom out"
          shortcuts={formatForDisplay("Mod+-")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<Maximize />}
          label="Fit to screen"
          shortcuts={formatForDisplay("Shift+1")}
        />
        <HelpShortcutElement
          icon={<Fullscreen />}
          label="Fit to selection"
          shortcuts={formatForDisplay("Shift+2")}
        />
        <HelpShortcutElement
          icon={<ScanEye />}
          label="Fit to page"
          shortcuts={formatForDisplay("Shift+3")}
        />
      </div>
    </div>
  );
};
