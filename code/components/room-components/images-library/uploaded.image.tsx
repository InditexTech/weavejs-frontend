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
import { useIACapabilities } from "@/store/ia";
import { useIACapabilitiesV2 } from "@/store/ia-v2";
import { cn } from "@/lib/utils";

type UploadedImageProps = { image: ImageEntity; selected: boolean };

export const UploadedImage = ({
  image,
  selected,
}: Readonly<UploadedImageProps>) => {
  const instance = useWeave((state) => state.instance);

  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );

  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );
  const imagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.visible
  );

  const imageUrl = React.useMemo(() => {
    return `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${image.roomId}/images/${image.imageId}`;
  }, [image]);

  if (!image) {
    return null;
  }

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.images) {
    return null;
  }

  return (
    <div
      key={image.imageId}
      className={cn(
        "group block w-full bg-light-background-1 object-cover relative border-0 border-zinc-200 cursor-pointer",
        {
          ["after:content-[''] after:absolute after:inset-0 after:bg-black/40 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300"]: true,
          ["after:content-[''] after:absolute after:inset-0 after:bg-black/40 after:opacity-100"]:
            selected,
        }
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={cn("w-full block object-cover", {
          [" after:content-[''] after:absolute after:inset-0 after:bg-black/40 after:opacity-0 hover:after:opacity-100 after:transition-opacity"]:
            selected,
        })}
        style={{
          aspectRatio: `${image.aspectRatio}`,
        }}
        id={image.imageId}
        data-image-id={image.imageId}
        draggable={
          imagesLLMPopupVisible || imagesLLMPopupVisibleV2 ? "false" : "true"
        }
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
