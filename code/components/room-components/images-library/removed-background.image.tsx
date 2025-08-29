// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
// import { Badge } from "@/components/ui/badge";
import { Image } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ImageEntity } from "./types";
import { useIACapabilities } from "@/store/ia";
import { useIACapabilitiesV2 } from "@/store/ia-v2";
import { cn } from "@/lib/utils";

type RemovedBackgroundImageProps = {
  image: ImageEntity;
  selected: boolean;
};

export const RemovedBackgroundImage = ({
  image,
  selected,
}: Readonly<RemovedBackgroundImageProps>) => {
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
      className="group block w-full bg-light-background-1 object-cover relative border-0 border-zinc-200"
    >
      {image.removalJobId === null &&
        ["created", "pending", "working"].includes(image.status) && (
          <div
            className="w-full h-full flex justify-center items-center"
            style={{
              width: "100%",
              height: "100%",
              aspectRatio: `${image.aspectRatio}`,
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image strokeWidth={1} size={32} stroke="#000000" fill="#ffffff" />
          </div>
        )}
      {["completed"].includes(image.status) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={cn("w-full block object-cover", {
            ["opacity-50"]: selected,
          })}
          style={{
            aspectRatio: `${image.aspectRatio}`,
          }}
          id={image.imageId}
          data-image-id={image.imageId}
          draggable={
            imagesLLMPopupVisible || imagesLLMPopupVisibleV2
              ? undefined
              : "true"
          }
          src={imageUrl}
          alt="An image"
        />
      )}
      {(["pending", "working"].includes(image.status) ||
        (image.removalJobId !== null &&
          image.removalStatus !== null &&
          ["pending", "working"].includes(image.removalStatus))) && (
        <div className="pulseOverlay"></div>
      )}
      {/* {image.removalJobId === null && ["pending"].includes(image.status) && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 text-white flex flex-col gap-1 justify-center items-center">
          <Badge
            className="px-1 font-inter tabular-nums rounded font-inter text-[11px]"
            variant="default"
          >
            WAITING
          </Badge>
        </div>
      )}
      {image.removalJobId === null && ["working"].includes(image.status) && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 text-white flex flex-col gap-1 justify-center items-center">
          <Badge
            className="px-1 font-inter tabular-nums rounded font-inter text-[11px]"
            variant="default"
          >
            REMOVING BG
          </Badge>
        </div>
      )}
      {image.removalJobId !== null &&
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
