// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { SquareDashed, TextSelect } from "lucide-react";
import { HelpShortcutElement } from "./help-shortcut-element";
import { formatForDisplay } from "@tanstack/react-hotkeys";

export const HelpSelection = () => {
  return (
    <div className="w-full grid grid-cols-2 py-3 gap-x-5">
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<TextSelect />}
          label="Select all"
          shortcuts={formatForDisplay("Shift+Mod+A")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<SquareDashed />}
          label="Select none"
          shortcuts={formatForDisplay("Shift+Esc")}
        />
      </div>
    </div>
  );
};
