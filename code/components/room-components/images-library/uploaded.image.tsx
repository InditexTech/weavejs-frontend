// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
// import { Badge } from "@/components/ui/badge";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ImageEntity } from "./types";
import { cn } from "@/lib/utils";

type UploadedImageProps = { image: ImageEntity; selected: boolean };

export const UploadedImage = ({
  image,
  selected,
}: Readonly<UploadedImageProps>) => {
  const instance = useWeave((state) => state.instance);

  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);

  const imageUrl = React.useMemo(() => {
    return `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${image.roomId}/images/${image.imageId}`;
  }, [image]);

  if (!image) {
    return null;
  }

  if (!instance) {
    return null;
  }

  if (sidebarActive !== SIDEBAR_ELEMENTS.images) {
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
          ["after:content-[''] after:absolute after:inset-0 after:bg-black/40 after:opacity-100"]:
            selected,
        }
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="w-full block object-cover relative transition-transform duration-500 group-hover:opacity-60"
        style={{
          aspectRatio: `${image.aspectRatio}`,
        }}
        id={image.imageId}
        data-image-id={image.imageId}
        draggable="true"
        src={imageUrl}
        alt="An image"
      />
      {image.removalJobId !== null &&
        image.removalStatus !== null &&
        ["pending", "working"].includes(image.removalStatus) && (
          <div className="pulseOverlay"></div>
        )}
      {/* {image.removalJobId !== null &&
        image.removalStatus !== null &&
        ["pending", "working"].includes(image.removalStatus) && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 text-white flex justify-center items-center">
            <Badge
              className="px-1 font-inter tabular-nums rounded font-inter text-[11px]"
              variant="default"
            >
              REMOVING
            </Badge>
          </div>
        )} */}
    </div>
  );
};
