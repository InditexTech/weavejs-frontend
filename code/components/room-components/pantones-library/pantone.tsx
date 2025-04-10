// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { getNearestPantone } from "pantone-tcx";
import { colorIsLight } from "@/lib/utils";

type PantoneProps = {
  color: string;
};

export const Pantone = ({ color }: Readonly<PantoneProps>) => {
  const nearestColor = getNearestPantone(color);

  let forefrontColor = "#ffffff";
  if (colorIsLight(color)) {
    forefrontColor = "#000000";
  }

  return (
    <div
      className="cursor-pointer w-full h-full p-3"
      draggable="true"
      data-pantonecolor={nearestColor.hex}
      style={{ background: nearestColor.hex }}
    >
      <div
        style={{ color: forefrontColor }}
        className="font-noto-sans-mono font-bold text-base"
      >
        {nearestColor.name}
      </div>
      <div
        style={{ color: forefrontColor }}
        className="font-noto-sans-mono text-xs"
      >
        TCX {nearestColor.tcx}
      </div>
    </div>
  );
};
