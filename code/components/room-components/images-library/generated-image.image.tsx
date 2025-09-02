// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ImageEntity } from "./types";
import { useIACapabilities } from "@/store/ia";
import { useIACapabilitiesV2 } from "@/store/ia-v2";
import { cn } from "@/lib/utils";
import { CircleOff } from "lucide-react";

type GeneratedImageProps = {
  image: ImageEntity;
  selected: boolean;
  operation: "background-removal" | "image-generation" | "image-edition";
};

export const GeneratedImage = ({
  image,
  selected,
  operation,
}: Readonly<GeneratedImageProps>) => {
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
        "group block w-full bg-white object-cover relative border-0 border-zinc-200 overflow-hidden",
        {
          ["cursor-pointer hover:bg-black"]:
            ["completed", "failed"].includes(image.status) &&
            image.removalJobId === null,
          ["after:content-[''] after:absolute after:inset-0 after:bg-black/40 after:opacity-100"]:
            selected,
        }
      )}
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
          ></div>
        )}
      {["failed"].includes(image.status) && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
          {operation === "background-removal" && (
            <div className="absolute inset-0 checkered transition-transform duration-500 group-hover:opacity-60"></div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full block object-cover relative transition-transform duration-500 group-hover:opacity-60"
            style={{
              aspectRatio: `${image.aspectRatio}`,
            }}
            id={image.imageId}
            data-image-id={image.imageId}
            draggable={
              imagesLLMPopupVisible || imagesLLMPopupVisibleV2 || selected
                ? undefined
                : "true"
            }
            src={imageUrl}
            alt="A generated image"
          />
        </>
      )}
      {(["pending", "working"].includes(image.status) ||
        (image.removalJobId !== null &&
          image.removalStatus !== null &&
          ["pending", "working"].includes(image.removalStatus))) && (
        <div className="pulseOverlay"></div>
      )}
    </div>
  );
};
