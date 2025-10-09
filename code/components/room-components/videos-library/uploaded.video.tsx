// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
// import { Badge } from "@/components/ui/badge";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { VideoEntity } from "./types";
import { cn } from "@/lib/utils";

type UploadedVideoProps = { video: VideoEntity; selected: boolean };

export const UploadedVideo = ({
  video,
  selected,
}: Readonly<UploadedVideoProps>) => {
  const instance = useWeave((state) => state.instance);

  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );

  const videoUrl = React.useMemo(() => {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${video.roomId}/videos/${video.videoId}`;
  }, [video]);

  if (!video) {
    return null;
  }

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.videos) {
    return null;
  }

  return (
    <div
      key={video.videoId}
      className={cn(
        "group block w-full object-cover bg-white relative border-0 border-zinc-200 overflow-hidden",
        {
          ["cursor-pointer hover:bg-black"]:
            ["completed"].includes(video.status) && video.removalJobId === null,
          ["after:content-[''] after:absolute after:inset-0 after:bg-black/40 after:opacity-100"]:
            selected,
        }
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <video
        className="w-full block object-cover relative transition-transform duration-500 group-hover:opacity-60"
        style={{
          aspectRatio: `${video.aspectRatio}`,
        }}
        controls
        id={video.videoId}
        data-video-id={video.videoId}
        data-video-width={video.width}
        data-video-height={video.height}
        data-video-url={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${video.roomId}/videos/${video.videoId}`}
        data-video-placeholder-url={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${video.roomId}/videos/${video.videoId}/placeholder`}
        draggable="true"
      >
        <source src={videoUrl} />
      </video>
      {video.removalJobId !== null &&
        video.removalStatus !== null &&
        ["pending", "working"].includes(video.removalStatus) && (
          <div className="pulseOverlay"></div>
        )}
    </div>
  );
};
