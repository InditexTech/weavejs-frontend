// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @next/next/no-img-element */

"use client";

import React from "react";
import { downscaleImageFromURL } from "@inditextech/weave-sdk";

type ChatBotImageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
};

function stripOrigin(url: string): string {
  const u = new URL(url);
  return u.pathname + u.search + u.hash;
}

export const ChatBotImage = ({ image }: ChatBotImageProps) => {
  const [downscaledImageDataUrl, setDownscaledImageDataUrl] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const getDownscaledImage = async () => {
      const dataURL = await downscaleImageFromURL(image.url, {
        maxWidth: 200,
        maxHeight: 200,
      });
      setDownscaledImageDataUrl(dataURL);
    };

    if (image.url) {
      getDownscaledImage();
    }
  }, [image.url]);

  return (
    <img
      src={image.url}
      alt="Generated Image"
      className="max-h-64 object-contain cursor-pointer border border-[#c9c9c9]"
      data-image-id={image.imageId}
      data-image-fallback={downscaledImageDataUrl}
      data-image-url={stripOrigin(image.url)}
    />
  );
};
