// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import Image from "next/image";
import logoSrc from "@/assets/images/logo.png";
import logoLandscapeSrc from "@/assets/images/logo-landscape.png";
import { cn } from "@/lib/utils";

type LogoProps = {
  kind?: "landscape" | "large" | "small";
  variant?: "no-text" | "text";
};

export function Logo({
  kind = "large",
  variant = "text",
}: Readonly<LogoProps>) {
  const width = React.useMemo(() => {
    if (kind === "landscape") return 345 * 0.6;
    if (kind === "large") return 64;
    if (kind === "small") return 40;
  }, [kind]);

  const height = React.useMemo(() => {
    if (kind === "landscape") return 40 * 0.6;
    if (kind === "large") return 64;
    if (kind === "small") return 40;
  }, [kind]);

  const src = React.useMemo(() => {
    if (kind === "landscape") return logoLandscapeSrc;
    return logoSrc;
  }, [kind]);

  return (
    <div className="p-0 bg-transparent flex justify-start items-center gap-2">
      <Image
        src={src}
        width={width}
        height={height}
        className={cn(`object-cover`, {
          ["w-[calc(345px*0.6)] h-[calc(40px*0.6)]"]: kind === "landscape",
          ["w-11 h-11"]: kind === "large",
          ["w-[40px] h-[40px]"]: kind === "small",
        })}
        alt="Weave.js logo"
      />
      {variant === "text" && (
        <div
          className={cn("font-inter font-extralight text-black !normal-case", {
            ["text-[32px]"]: kind === "large",
            ["text-[22px]"]: kind === "small",
          })}
        >
          Weave.js
        </div>
      )}
    </div>
  );
}
