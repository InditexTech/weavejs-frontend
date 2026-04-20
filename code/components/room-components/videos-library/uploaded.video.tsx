// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { VideoEntity } from "./types";
import { cn } from "@/lib/utils";

type UploadedVideoProps = { video: VideoEntity; selected: boolean };

export const UploadedVideo = ({
  video,
  selected,
}: Readonly<UploadedVideoProps>) => {
  const instance = useWeave((state) => state.instance);

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const videoUrl = React.useMemo(() => {
    return `${apiEndpoint}/${hubName}/rooms/${video.roomId}/videos/${video.videoId}`;
  }, [video, apiEndpoint, hubName]);

  if (!video) {
    return null;
  }

  if (!instance) {
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
        },
      )}
    >
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
        data-video-url={`${apiEndpoint}/${hubName}/rooms/${video.roomId}/videos/${video.videoId}`}
        data-video-placeholder-url={`${apiEndpoint}/${hubName}/rooms/${video.roomId}/videos/${video.videoId}/placeholder`}
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
