// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { ImageEntity } from "./types";
import { cn } from "@/lib/utils";
import { downscaleImageFromURL } from "@inditextech/weave-sdk";

type UploadedImageProps = { image: ImageEntity; selected: boolean };

export const UploadedImage = ({
  image,
  selected,
}: Readonly<UploadedImageProps>) => {
  const [downscaledImageDataUrl, setDownscaledImageDataUrl] = React.useState<
    string | null
  >(null);

  const instance = useWeave((state) => state.instance);

  const imageUrl = React.useMemo(() => {
    const apiEndpoint = import.meta.env.VITE_API_V2_ENDPOINT;
    const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

    return `${apiEndpoint}/${hubName}/rooms/${image.roomId}/images/${image.imageId}`;
  }, [image]);

  React.useEffect(() => {
    const getDownscaledImage = async () => {
      const dataURL = await downscaleImageFromURL(imageUrl, {
        maxWidth: 200,
        maxHeight: 200,
      });
      setDownscaledImageDataUrl(dataURL);
    };

    if (imageUrl) {
      getDownscaledImage();
    }
  }, [imageUrl]);

  if (!image) {
    return null;
  }

  if (!instance) {
    return null;
  }

  if (!downscaledImageDataUrl) {
    return null;
  }

  return (
    <div
      key={image.imageId}
      className={cn(
        "group block w-full object-cover bg-white relative border-0 border-zinc-200 overflow-hidden",
        {
          ["cursor-pointer hover:bg-black"]:
            ["completed"].includes(image.status) && image.removalJobId === null,
          ["after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-black/40 after:opacity-100"]:
            selected,
        },
      )}
    >
      <img
        className="w-full block object-cover relative transition-transform duration-500 group-hover:opacity-60"
        style={{
          aspectRatio: `${image.aspectRatio}`,
        }}
        id={image.imageId}
        data-image-id={image.imageId}
        data-image-url={imageUrl}
        data-image-fallback={downscaledImageDataUrl}
        draggable="true"
        src={imageUrl}
        alt="An image"
      />
      {image.removalJobId !== null &&
        image.removalStatus !== null &&
        ["pending", "working"].includes(image.removalStatus) && (
          <div className="pulseOverlay"></div>
        )}
    </div>
  );
};
