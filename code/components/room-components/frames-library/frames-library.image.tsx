// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import Image from "next/image";

type FrameImageProps = {
  image: HTMLImageElement;
};

export const FrameImage = ({ image }: Readonly<FrameImageProps>) => {
  return (
    <div className="w-full aspect-video border border-[#c9c9c9]">
      <Image
        src={image.src}
        width={320}
        height={225}
        alt="A frame image"
        className="object-fit w-full h-auto"
      />
    </div>
  );
};
