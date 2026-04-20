// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Image } from "@unpic/react";
import { PresentationImage } from "./utils";

type FramePresentationImageProps = {
  presentationImage: PresentationImage;
};

export const FramePresentationImage = ({
  presentationImage,
}: Readonly<FramePresentationImageProps>) => {
  return (
    <Image
      src={presentationImage.img.src}
      width={1920}
      height={1080}
      alt="A frame image"
      className="object-contain w-auto h-full"
    />
  );
};
