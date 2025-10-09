// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { WeaveStateElement } from "@inditextech/weave-types";
import { delVideo } from "@/api/del-video";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { VideoEntity } from "./types";
import { cn } from "@/lib/utils";

type VideoLibraryActions = {
  videos: VideoEntity[];
  appVideos: WeaveStateElement[];
  selectedVideos: VideoEntity[];
};

export const VideosLibraryActions = ({
  videos,
  appVideos,
  selectedVideos,
}: Readonly<VideoLibraryActions>) => {
  const instance = useWeave((state) => state.instance);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );

  const mutationDelete = useMutation({
    mutationFn: async (videoId: string) => {
      return await delVideo(
        user?.name ?? "",
        clientId ?? "",
        room ?? "",
        videoId
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting videos deletion...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting videos deletion.");
    },
  });

  const handleDeleteVideo = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (video: any) => {
      if (!instance) {
        return;
      }

      mutationDelete.mutate(video.videoId);
    },
    [instance, mutationDelete]
  );

  const realSelectedVideos = React.useMemo(() => {
    return selectedVideos.filter((video) => videos.includes(video));
  }, [selectedVideos, videos]);

  const inUseSelectedVideos = React.useMemo(() => {
    const inUse = [];

    for (const video of realSelectedVideos) {
      const appVideo = appVideos.find(
        (appVideo) => appVideo.props.videoId === video.videoId
      );
      if (typeof appVideo !== "undefined") {
        inUse.push(video);
      }
    }

    return inUse;
  }, [realSelectedVideos, appVideos]);

  const actions = React.useMemo(() => {
    const selectionActions = [];

    if (realSelectedVideos.length > 0 && inUseSelectedVideos.length === 0) {
      selectionActions.push(
        <button
          key="delete-selected"
          className="cursor-pointer flex gap-2 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
          onClick={() => {
            for (const video of realSelectedVideos) {
              handleDeleteVideo(video);
            }
          }}
        >
          <Trash strokeWidth={1} size={16} stroke="red" />
        </button>
      );
    }

    return selectionActions;
  }, [handleDeleteVideo, inUseSelectedVideos.length, realSelectedVideos]);

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.videos) {
    return null;
  }

  return (
    <div className="w-full h-[40px] p-3 px-6 bg-white flex justify-between items-center border-t-[0.5px] border-[#c9c9c9]">
      <div
        className={cn("flex gap-2 items-center font-inter font-light text-xs", {
          ["justify-start"]: actions.length > 0,
          ["w-full justify-center"]: actions.length === 0,
        })}
      >
        {actions.length > 0 ? "SELECTION ACTIONS" : <span>select a video</span>}
      </div>
      <div className="flex gap-2 justify-end items-center">{actions}</div>
    </div>
  );
};
