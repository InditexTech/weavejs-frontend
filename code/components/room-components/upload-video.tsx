// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postVideo } from "@/api/post-video";
import { useWeave } from "@inditextech/weave-react";
import { toast } from "sonner";

export function UploadVideo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const showSelectFile = useCollaborationRoom(
    (state) => state.videos.showSelectFile
  );
  const setUploadingVideo = useCollaborationRoom(
    (state) => state.setUploadingVideo
  );
  const setShowSelectFileVideo = useCollaborationRoom(
    (state) => state.setShowSelectFileVideo
  );

  const queryClient = useQueryClient();

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postVideo(room ?? "", file);
    },
  });

  const handleUploadFile = React.useCallback(
    (file: File) => {
      setUploadingVideo(true);
      mutationUpload.mutate(file, {
        onSuccess: (data) => {
          const queryKey = ["getVideos", room];
          queryClient.invalidateQueries({ queryKey });

          if (!instance) {
            return;
          }

          inputFileRef.current.value = null;
          const roomId = data.video.roomId;
          const videoId = data.video.videoId;

          const { finishUploadCallback } = instance.triggerAction(
            "videoTool"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) as any;

          instance.updatePropsAction("videoTool", {
            videoId,
            width: data.video.width,
            height: data.video.height,
          });

          finishUploadCallback?.({
            url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${roomId}/videos/${videoId}`,
            placeholderUrl: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${roomId}/videos/${videoId}/placeholder`,
          });
        },
        onError: (ex) => {
          instance?.cancelAction("videoTool");

          console.error(ex);
          console.error("Error uploading video");

          toast.error("Error uploading video");
        },
        onSettled: () => {
          setUploadingVideo(false);
        },
      });
    },
    [instance, room, mutationUpload, queryClient, setUploadingVideo]
  );

  React.useEffect(() => {
    const onStageDrop = (e: DragEvent) => {
      if (window.weaveDragVideoParams) {
        return;
      }

      if (e.dataTransfer?.items) {
        [...e.dataTransfer?.items].forEach((item) => {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) {
              handleUploadFile(file);
            }
          }
        });
        return;
      }
      if (e.dataTransfer?.files) {
        [...e.dataTransfer.files].forEach((file) => {
          handleUploadFile(file);
        });
        return;
      }
    };

    if (instance) {
      instance.addEventListener("onStageDrop", onStageDrop);
    }

    if (showSelectFile && inputFileRef.current) {
      inputFileRef.current.addEventListener("cancel", () => {
        instance?.cancelAction("videoTool");
      });
      inputFileRef.current.click();
      setShowSelectFileVideo(false);
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onStageDrop", onStageDrop);
      }
    };
  }, [
    instance,
    showSelectFile,
    mutationUpload,
    handleUploadFile,
    setUploadingVideo,
    setShowSelectFileVideo,
  ]);

  return (
    <input
      type="file"
      accept="video/mp4, video/quicktime"
      name="video"
      ref={inputFileRef}
      className="hidden"
      onClick={() => {
        inputFileRef.current.value = null;
      }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          handleUploadFile(file);
        }
      }}
    />
  );
}
