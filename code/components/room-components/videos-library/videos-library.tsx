// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import Masonry from "react-responsive-masonry";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { Info, SquareCheck, SquareX, Trash2, X } from "lucide-react";
import {
  WeaveStateElement,
  WeaveElementAttributes,
} from "@inditextech/weave-types";
import { delVideo } from "@/api/del-video";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { UploadedVideo } from "./uploaded.video";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { VideoEntity } from "./types";
import { VideosLibraryActions } from "./videos-ibrary.actions";
import { getVideos } from "@/api/get-videos";

const VIDEOS_LIMIT = 20;

export const VideosLibrary = () => {
  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);

  const [selectedVideos, setSelectedVideos] = React.useState<VideoEntity[]>([]);
  const [videos, setVideos] = React.useState<VideoEntity[]>([]);
  const [showSelection, setShowSelection] = React.useState<boolean>(false);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
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

  const query = useInfiniteQuery({
    queryKey: ["getVideos", room],
    queryFn: async ({ pageParam }) => {
      if (!room) {
        return [];
      }
      return await getVideos(room ?? "", pageParam as number, VIDEOS_LIMIT);
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: workloadsEnabled ? 0 : "",
    getNextPageParam: (lastPage, allPages) => {
      if (!workloadsEnabled) {
        return lastPage.continuationToken;
      }
      const loadedSoFar = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0
      );
      if (loadedSoFar < lastPage.total) {
        return loadedSoFar; // next offset
      }
      return undefined; // no more pages
    },
    enabled: sidebarLeftActive === "videos",
  });

  const appVideos = React.useMemo(() => {
    function extractVideos(
      videos: WeaveStateElement[],
      node: WeaveStateElement
    ) {
      if (node.props && node.props.nodeType === "video" && node.props.videoId) {
        videos.push(node);
      }
      if (node.props && node.props.children) {
        for (const child of node.props.children) {
          extractVideos(videos, child);
        }
      }
    }

    const mainStateProps: WeaveElementAttributes = appState.weave
      .props as WeaveElementAttributes;

    const mainStateChildren: WeaveStateElement[] | undefined =
      mainStateProps?.children;
    const mainLayerElement: WeaveStateElement | undefined =
      mainStateChildren?.find((child: WeaveStateElement) => {
        return child.key === "mainLayer";
      });

    const videos: WeaveStateElement[] = [];

    if (typeof mainLayerElement === "undefined") {
      return videos;
    }

    extractVideos(videos, mainLayerElement);

    return videos;
  }, [appState]);

  React.useEffect(() => {
    if (!query.data) return;
    setVideos((prev: VideoEntity[]) =>
      (query.data?.pages.flatMap((page) => page.items) ?? []).map(
        (newItem: VideoEntity) =>
          prev.find(
            (oldItem) =>
              oldItem.videoId === newItem.videoId &&
              oldItem.updatedAt === newItem.updatedAt
          ) || newItem
      )
    );
  }, [query.data]);

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  const realSelectedVideos = React.useMemo(() => {
    return selectedVideos.filter((video) => videos.includes(video));
  }, [selectedVideos, videos]);

  const handleCheckNone = React.useCallback(() => {
    setSelectedVideos([]);
  }, []);

  const handleCheckAll = React.useCallback(() => {
    const newSelectedVideos = [];

    for (const video of videos) {
      const appVideo = appVideos.find(
        (appVideo) => appVideo.props.videoId === video.videoId
      );

      if (
        typeof appVideo === "undefined" &&
        ["completed"].includes(video.status) &&
        video.removalJobId === null
      ) {
        newSelectedVideos.push(video);
      }
    }

    setSelectedVideos(newSelectedVideos);
  }, [videos, appVideos]);

  const handleCheckboxChange = React.useCallback(
    (checked: boolean, video: VideoEntity) => {
      let newSelectedVideos = [...selectedVideos];
      if (checked) {
        newSelectedVideos.push(video);
      } else {
        newSelectedVideos = newSelectedVideos.filter(
          (actVideo) => actVideo !== video
        );
      }
      const unique = [...new Set(newSelectedVideos)];
      setSelectedVideos(unique);
    },
    [selectedVideos]
  );

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.videos) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-[24px] py-[27px] bg-white flex justify-between items-center border-b-[0.5px] border-[#c9c9c9]">
        <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
          <SidebarSelector title="Videos" />
        </div>
        <div className="flex justify-end items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="selection-mode"
              checked={showSelection}
              onCheckedChange={(checked) => {
                setShowSelection(checked);
              }}
              className="w-[32px] cursor-pointer"
            />
            <Label
              htmlFor="selection-mode"
              className="!font-inter !text-xs cursor-pointer"
            >
              SELECTION
            </Label>
          </div>
          <button
            className="cursor-pointer flex justify-center items-center w-[20px] h-[40px] text-center bg-transparent hover:text-[#c9c9c9]"
            onClick={() => {
              setSidebarActive(null);
            }}
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
      {showSelection && (
        <div className="w-full h-[40px] p-0 px-6 bg-white flex justify-between items-center border-b-[0.5px] border-[#c9c9c9]">
          <div className="flex gap-1 justify-start items-center font-inter font-light text-xs">
            SELECTED{" "}
            <Badge className="font-inter text-xs">
              {realSelectedVideos.length}
            </Badge>
          </div>
          <div className="flex gap-2 justify-end items-center">
            <button
              className="cursor-pointer flex gap-1 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
              onClick={() => {
                handleCheckNone();
              }}
            >
              <span>NONE</span> <SquareX size={20} strokeWidth={1} />
            </button>
            <button
              className="cursor-pointer flex gap-1 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
              onClick={() => {
                handleCheckAll();
              }}
            >
              <span>ALL</span>
              <SquareCheck size={20} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}
      <ScrollArea
        className={cn("w-full overflow-auto", {
          ["h-[calc(100%-95px-40px-40px)]"]: showSelection,
          ["h-[calc(100%-95px)]"]: !showSelection,
        })}
      >
        <div
          className="w-full weaveDraggable p-0"
          onDragStart={(e) => {
            if (e.target instanceof HTMLVideoElement) {
              window.weaveDragVideoParams = {
                placeholderUrl: e.target.dataset.videoPlaceholderUrl,
                url: e.target.dataset.videoUrl,
                width: parseInt(e.target.dataset.videoWidth ?? "0"),
                height: parseInt(e.target.dataset.videoHeight ?? "0"),
              };
              window.weaveDragVideoId = e.target.dataset.videoId;
            }
          }}
        >
          {videos.length === 0 && (
            <div className="col-span-1 w-full h-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
              <b className="font-normal text-[18px]">No videos</b>
              <span className="text-[14px]">Add a video to the room.</span>
            </div>
          )}
          <Masonry sequential columnsCount={2} gutter="1px">
            {videos.length > 0 &&
              videos.map((video) => {
                const appVideo = appVideos.find(
                  (appVideo) => appVideo.props.videoId === video.videoId
                );

                const isChecked = realSelectedVideos.includes(video);

                const videoComponent = (
                  <UploadedVideo
                    key={video.videoId}
                    selected={isChecked}
                    video={video}
                  />
                );

                return (
                  <div
                    key={video.videoId}
                    className="w-full"
                    onClick={() => {
                      if (
                        showSelection &&
                        !(
                          ["pending", "working"].includes(video.status) ||
                          (video.removalJobId !== null &&
                            video.removalStatus !== null &&
                            ["pending", "working"].includes(
                              video.removalStatus
                            ))
                        )
                      ) {
                        handleCheckboxChange(!isChecked, video);
                      }
                    }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <div className="group relative w-full">
                          {videoComponent}
                          {showSelection &&
                            typeof appVideo === "undefined" &&
                            !(
                              ["pending", "working"].includes(video.status) ||
                              (video.removalJobId !== null &&
                                video.removalStatus !== null &&
                                ["pending", "working"].includes(
                                  video.removalStatus
                                ))
                            ) && (
                              <div className="absolute top-[8px] right-[8px] z-10">
                                <Checkbox
                                  id="terms"
                                  className="bg-white rounded-none cursor-pointer"
                                  value={video.videoId}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    handleCheckboxChange(
                                      checked as boolean,
                                      video
                                    );
                                  }}
                                />
                              </div>
                            )}
                          {typeof appVideo !== "undefined" && (
                            <div className="absolute right-0 bottom-0 hidden group-hover:flex gap-1 justify-start items-end p-2">
                              <Badge
                                className="px-1 font-inter tabular-nums rounded font-inter text-[11px]"
                                variant="default"
                              >
                                IN USE
                              </Badge>
                            </div>
                          )}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-52 rounded-none border-0 border-[#c9c9c9] shadow-none">
                        {typeof appVideo !== "undefined" && (
                          <>
                            <ContextMenuItem
                              disabled
                              className="rounded-none uppercase font-inter text-xs"
                            >
                              <Info
                                strokeWidth={1}
                                size={16}
                                className="mr-2"
                              />
                              In use
                            </ContextMenuItem>
                          </>
                        )}
                        {typeof appVideo === "undefined" && (
                          <>
                            <ContextMenuItem
                              className="rounded-none uppercase font-inter text-xs"
                              disabled={typeof appVideo !== "undefined"}
                              onClick={() => {
                                handleDeleteVideo(video);
                              }}
                            >
                              <Trash2
                                strokeWidth={1}
                                size={16}
                                className="mr-2"
                              />
                              Delete
                            </ContextMenuItem>
                          </>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                  </div>
                );
              })}
          </Masonry>
          <div ref={ref} className="h-[0px]" />
          {query.isFetchingNextPage && (
            <p className="font-inter text-xs uppercase text-center py-4">
              loading more...
            </p>
          )}
        </div>
      </ScrollArea>
      {showSelection && (
        <VideosLibraryActions
          videos={videos}
          appVideos={appVideos}
          selectedVideos={selectedVideos}
        />
      )}
    </div>
  );
};
