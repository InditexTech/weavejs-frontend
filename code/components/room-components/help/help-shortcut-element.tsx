// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";

type HelpShortcutElement = {
  icon: React.ReactElement;
  label: string;
  shortcuts: string;
};

export const HelpShortcutElement = ({
  icon,
  label,
  shortcuts,
}: Readonly<HelpShortcutElement>) => {
  return (
    <div className="flex justify-between items-center text-white">
      <div className="flex gap-2 justify-start items-center">
        {React.cloneElement(icon, { size: 20 })}
        <div className="text-white font-inter text-sm">{label}</div>
      </div>
      {shortcuts}
    </div>
  );
};
