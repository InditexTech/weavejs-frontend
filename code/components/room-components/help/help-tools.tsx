// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  Brush,
  ImagePlus,
  Images,
  MessageSquare,
  MousePointer,
  PenLine,
  Square,
  SwatchBook,
  Type,
  Frame,
} from "lucide-react";
import { HelpShortcutElement } from "./help-shortcut-element";
import { useCollaborationRoom } from "@/store/store";
import { formatForDisplay } from "@tanstack/react-hotkeys";

export const HelpTools = () => {
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads,
  );

  return (
    <div className="w-full grid grid-cols-3 py-3 gap-x-5">
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<MousePointer />}
          label="Select tool"
          shortcuts={formatForDisplay("S")}
        />
        <HelpShortcutElement
          icon={<Frame />}
          label="Frame tool"
          shortcuts={formatForDisplay("F")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<Square />}
          label="Rectangle tool"
          shortcuts={formatForDisplay("R")}
        />
        <HelpShortcutElement
          icon={<PenLine />}
          label="Line tool"
          shortcuts={formatForDisplay("L")}
        />
        <HelpShortcutElement
          icon={<Brush />}
          label="Brush tool"
          shortcuts={formatForDisplay("B")}
        />
        <HelpShortcutElement
          icon={<Type />}
          label="Text tool"
          shortcuts={formatForDisplay("T")}
        />
      </div>
      <div className="flex flex-col gap-3">
        <HelpShortcutElement
          icon={<ImagePlus />}
          label="Image tool"
          shortcuts={formatForDisplay("I")}
        />
        <HelpShortcutElement
          icon={<Images />}
          label="Images tool"
          shortcuts={formatForDisplay("O")}
        />
        {threadsEnabled && (
          <HelpShortcutElement
            icon={<MessageSquare />}
            label="Comment tool"
            shortcuts={formatForDisplay("H")}
          />
        )}
        <HelpShortcutElement
          icon={<SwatchBook />}
          label="Color Token tool"
          shortcuts={formatForDisplay("P")}
        />
      </div>
    </div>
  );
};
