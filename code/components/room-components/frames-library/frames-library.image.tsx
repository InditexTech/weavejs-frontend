// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Image } from "@unpic/react";
import { cn } from "@/lib/utils";

type FrameImageProps = {
  image: HTMLImageElement;
  title?: string;
  className?: string;
  actions?: React.ReactNode;
};

export const FrameImage = ({
  image,
  title,
  className,
  actions,
}: Readonly<FrameImageProps>) => {
  return (
    <div
      className={cn(
        "relative w-full aspect-video border-[0.5px] border-[#c9c9c9] rounded-lg overflow-hidden",
        className,
      )}
    >
      <Image
        src={image.src}
        alt="A frame image"
        className="object-fit w-full h-auto"
        layout="fullWidth"
      />
      {title && (
        <div className="absolute bottom-3 left-3 bg-black rounded-lg p-3 py-2 font-light text-sm text-white max-w-[calc(100%-24px)] truncate">
          {title}
        </div>
      )}
      {actions && <div className="absolute top-3 left-3">{actions}</div>}
    </div>
  );
};
