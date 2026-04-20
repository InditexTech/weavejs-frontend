// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { ImageEntity } from "./types";
import { cn } from "@/lib/utils";
import { CircleOff, Settings } from "lucide-react";

type GeneratedImageProps = {
  image: ImageEntity;
  selected: boolean;
};

export const GeneratedImage = React.memo(
  ({ image, selected }: Readonly<GeneratedImageProps>) => {
    const instance = useWeave((state) => state.instance);

    const imageUrl = React.useMemo(() => {
      const apiEndpoint = import.meta.env.VITE_API_V2_ENDPOINT;
      const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

      return `${apiEndpoint}/${hubName}/rooms/${image.roomId}/images/${image.imageId}`;
    }, [image]);

    if (!image) {
      return null;
    }

    if (!instance) {
      return null;
    }

    return (
      <div
        key={image.imageId}
        className={cn(
          "group block w-full bg-white object-cover relative border-0 border-zinc-200 overflow-hidden",
          {
            ["cursor-pointer hover:bg-black"]:
              ["completed", "failed"].includes(image.status) &&
              image.removalJobId === null,
            ["after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-black/40 after:opacity-100"]:
              selected,
          },
        )}
      >
        {image.removalJobId === null &&
          ["created", "pending", "working"].includes(image.status) && (
            <>
              <div className="absolute inset-0 checkered transition-transform duration-500 group-hover:opacity-60"></div>
              <div
                className="w-full border border-[#c9c9c9] object-cover pointer-events-none block relative"
                style={{
                  aspectRatio: `${image.aspectRatio}`,
                }}
              >
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-black flex flex-col gap-0 justify-center items-center">
                  <Settings strokeWidth={1} size={32} color="white" />
                </div>
              </div>
            </>
          )}
        {["failed"].includes(image.status) && (
          <>
            <div
              className="w-full block object-cover bg-[#ededed] flex justify-center items-center relative transition-transform duration-500 group-hover:opacity-60"
              style={{
                width: `100%`,
                aspectRatio: `${image.aspectRatio}`,
              }}
              id={image.imageId}
            >
              <CircleOff strokeWidth={1} size={32} color="black" />
            </div>
          </>
        )}
        {["completed"].includes(image.status) && (
          <>
            <div className="absolute inset-0 checkered transition-transform duration-500 group-hover:opacity-60"></div>
            <img
              className="w-full block border border-[#c9c9c9] object-cover relative transition-transform duration-500 group-hover:opacity-60"
              style={{
                aspectRatio: `${image.aspectRatio}`,
              }}
              key={image.imageId}
              id={image.imageId}
              data-image-url={imageUrl}
              data-image-id={image.imageId}
              data-image-fallback={imageUrl}
              draggable="true"
              src={imageUrl}
              alt="A generated image"
              loading="lazy"
              decoding="async"
            />
          </>
        )}
        {(["created", "pending", "working"].includes(image.status) ||
          (image.removalJobId !== null &&
            image.removalStatus !== null &&
            ["pending", "working"].includes(image.removalStatus))) && (
          <div className="pulseOverlay"></div>
        )}
      </div>
    );
  },
);
