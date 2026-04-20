// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { Image } from "@unpic/react";
import { toast } from "sonner";
import { postGeneratePresentationModeImagesAsync } from "@/api/post-generate-presentation-mode-images-async";
import { useCollaborationRoom } from "@/store/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { WeaveExportNodesOptions } from "@inditextech/weave-types";
import {
  LoaderCircle,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  XIcon,
} from "lucide-react";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { useWeave } from "@inditextech/weave-react";
import { Progress } from "@/components/ui/progress";
import { getAllPages } from "@/api/pages/get-all-pages";
import { Logo } from "@/components/utils/logo";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGetSession } from "@/components/room-components/hooks/use-get-session";

export const PresentationMode = () => {
  const instance = useWeave((state) => state.instance);

  const [actualRoomId, setActualRoomId] = React.useState<string | undefined>(
    undefined,
  );
  const [loadPages, setLoadPages] = React.useState(false);
  const [actualPage, setActualPage] = React.useState<number>(0);

  const { session } = useGetSession();

  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const pageInfo = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const clientId = useCollaborationRoom((state) => state.clientId);
  const presentationInstanceId = useCollaborationRoom(
    (state) => state.presentation.instanceId,
  );
  const presentationModeVisible = useCollaborationRoom(
    (state) => state.presentation.visible,
  );
  const presentationModeStatus = useCollaborationRoom(
    (state) => state.presentation.status,
  );
  const loadedPages = useCollaborationRoom(
    (state) => state.presentation.loadedPages,
  );
  const setPresentationPagesStatus = useCollaborationRoom(
    (state) => state.setPresentationPagesStatus,
  );
  const setPresentationStatus = useCollaborationRoom(
    (state) => state.setPresentationStatus,
  );
  const setPresentationMode = useCollaborationRoom(
    (state) => state.setPresentationVisible,
  );

  useHotkey({ key: "Esc", mod: false, shift: false }, () => {
    if (presentationModeVisible) {
      setPresentationMode(false);
    }
  });

  useHotkey({ key: "ArrowLeft", mod: false, shift: false }, () => {
    if (presentationModeVisible && presentationModeStatus === "loaded") {
      setActualPage((prev) => (prev - 1 < 0 ? 0 : prev - 1));
    }
  });

  useHotkey({ key: "ArrowRight", mod: false, shift: false }, () => {
    if (presentationModeVisible && presentationModeStatus === "loaded") {
      setActualPage((prev) =>
        prev + 1 >= totalPages ? totalPages - 1 : prev + 1,
      );
    }
  });

  useHotkey({ key: "ArrowLeft", mod: false, shift: true }, () => {
    if (presentationModeVisible && presentationModeStatus === "loaded") {
      setActualPage(0);
    }
  });

  useHotkey({ key: "ArrowRight", mod: false, shift: true }, () => {
    if (presentationModeVisible && presentationModeStatus === "loaded") {
      setActualPage(totalPages - 1);
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["getAllPages", pageInfo?.roomId ?? ""],
    queryFn: () => {
      return getAllPages(pageInfo?.roomId ?? "", "active");
    },
    enabled: !!pageInfo?.roomId && loadPages,
  });

  const pages = React.useMemo(() => {
    if (!data) {
      return [];
    }

    return data.items;
  }, [data]);

  const pageURL = React.useMemo(() => {
    if (!presentationInstanceId) {
      return null;
    }

    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
    const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

    const roomId = pages[actualPage]?.roomId;
    const pageId = pages[actualPage]?.pageId;

    return `${apiEndpoint}/${hubName}/rooms/${roomId}/presentation-mode/${presentationInstanceId}/pages/${pageId}/image`;
  }, [actualPage, presentationInstanceId, pages]);

  const mutateGenerateImages = useMutation({
    mutationFn: async ({
      type,
      area,
      roomId,
      options,
    }: {
      type: "area";
      area: { x: number; y: number; width: number; height: number };
      roomId: string;
      options: WeaveExportNodesOptions;
    }) => {
      setPresentationStatus("loading");
      return await postGeneratePresentationModeImagesAsync(
        session?.user.id ?? "",
        clientId ?? "",
        roomId,
        type,
        area,
        options,
      );
    },
    onError(error) {
      setPresentationStatus("error");
      console.error(error);
      toast.error("Error requesting export of room to PDF, please try again");
    },
  });

  React.useEffect(() => {
    if (!presentationModeVisible) {
      setActualPage(0);
      setPresentationStatus("idle");
      setPresentationPagesStatus(0);
      setLoadPages(false);
    }

    if (presentationModeVisible) {
      setLoadPages(true);
    }

    if (actualRoomId !== pageInfo?.roomId) {
      setActualPage(0);
      setPresentationStatus("idle");
      setPresentationPagesStatus(0);
      setLoadPages(false);
      setActualRoomId(pageInfo.roomId);
    }
  }, [
    presentationModeVisible,
    setPresentationPagesStatus,
    setPresentationStatus,
    pageInfo,
    actualRoomId,
  ]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (
      loadPages &&
      !isLoading &&
      presentationModeVisible &&
      presentationModeStatus === "idle"
    ) {
      const exportAreaReferencePlugin =
        instance.getPlugin<ExportAreaReferencePlugin>(
          EXPORT_AREA_REFERENCE_PLUGIN_KEY,
        );

      if (!exportAreaReferencePlugin) {
        return;
      }

      const stage = instance.getStage();
      const exportRect = exportAreaReferencePlugin.getExportRect({
        relativeTo: stage,
      });

      mutateGenerateImages.mutate({
        type: "area",
        area: exportRect,
        roomId: pageInfo.roomId,
        options: {
          pixelRatio: 1,
          padding: 0,
        },
      });
    }
  }, [
    instance,
    mutateGenerateImages,
    pageInfo,
    loadPages,
    isLoading,
    presentationModeVisible,
    presentationModeStatus,
  ]);

  const totalPages = React.useMemo(() => {
    if (!data) {
      return 0;
    }

    return data.items.length;
  }, [data]);

  if (!presentationModeVisible) {
    return null;
  }

  return (
    <div className="fixed z-[100] top-0 left-0 right-0 bottom-0 bg-white flex flex-col gap-3 justify-center items-start">
      <div className="absolute top-[16px] right-[16px] flex justify-end items-center p-1">
        <div className="flex justify-end items-center bg-white drop-shadow">
          <button
            className="cursor-pointer bg-transparent hover:bg-accent p-2"
            onClick={() => {
              setPresentationMode(false);
            }}
          >
            <XIcon size={24} strokeWidth={1} />
          </button>
        </div>
      </div>
      {loadPages && !isLoading && presentationModeStatus === "loaded" && (
        <>
          <div className="absolute top-[16px] left-[16px] flex justify-center items-center">
            <div className="flex gap-3 justify-start items-center bg-white px-5 py-3 border-[0.5px] border-[#c9c9c9] drop-shadow rounded-none">
              <p className="font-light text-2xl text-muted-foreground">
                {roomInfo?.room.name ?? ""}
              </p>
              <div className="w-[1px] h-[20px] bg-[#c9c9c9]" />
              <p className="font-light text-2xl">
                {pages[actualPage]?.name ?? ""}
              </p>
            </div>
          </div>
          <div className="absolute bottom-[16px] left-[16px] right-[16px] flex justify-center items-center">
            <div className="flex justify-center items-center">
              <div className="flex justify-end items-center bg-white p-1 border-[0.5px] border-[#c9c9c9] drop-shadow rounded-none">
                <button
                  className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-none hover:text-[#666666]"
                  disabled={actualPage === 0}
                  onClick={() => {
                    setActualPage(0);
                  }}
                >
                  <SkipBack
                    className="group-disabled:text-accent"
                    strokeWidth={1}
                    size={24}
                  />
                </button>
                <button
                  className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-none"
                  disabled={actualPage === 0}
                  onClick={() => {
                    setActualPage((prev) => prev - 1);
                  }}
                >
                  <StepBack
                    className="group-disabled:text-accent"
                    strokeWidth={1}
                    size={24}
                  />
                </button>
                <div className="w-[0.5px] h-[20px] bg-[#c9c9c9] mx-2" />
                <div className="px-5 font-mono text-sm text-center text-muted-foreground">
                  {actualPage + 1} / {pages.length}
                </div>
                <div className="w-[0.5px] h-[20px] bg-[#c9c9c9] mx-2" />
                <button
                  className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-none"
                  disabled={actualPage === pages.length - 1}
                  onClick={() => {
                    setActualPage((prev) => prev + 1);
                  }}
                >
                  <StepForward
                    className="group-disabled:text-accent"
                    strokeWidth={1}
                    size={24}
                  />
                </button>
                <button
                  className="group cursor-pointer bg-transparent disabled:cursor-default hover:disabled:bg-transparent hover:bg-accent p-2 rounded-none"
                  disabled={actualPage === pages.length - 1}
                  onClick={() => {
                    setActualPage(pages.length - 1);
                  }}
                >
                  <SkipForward
                    className="group-disabled:text-accent"
                    strokeWidth={1}
                    size={24}
                  />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div
        className={cn("w-full h-full flex justify-center items-center", {
          ["bg-white"]: isLoading || presentationModeStatus === "loading",
          ["bg-black"]: presentationModeStatus === "loaded" && pageURL,
        })}
      >
        {(isLoading || presentationModeStatus === "loading") && (
          <div className="w-full h-full flex flex-col gap-8 justify-center items-center">
            <div className="w-full flex flex-col gap-2 justify-center items-center">
              <Logo kind="landscape" variant="no-text" />
              <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
                SHOWCASE
              </h1>
            </div>
            <div className="w-full flex flex-col gap-2 justify-center items-center">
              <div className="text-center text-base text-[#757575]">
                <p>ROOM</p>
              </div>
              <Badge
                className="ml-2 font-light text-2xl max-w-lg rounded-sm overflow-hidden text-ellipsis whitespace-nowrap"
                variant="outline"
              >
                {roomInfo?.room.name ?? ""}
              </Badge>
            </div>
            {presentationModeStatus === "loading" && (
              <div className="flex flex-col gap-3 justify-center items-center">
                <div className="w-[320px] flex justify-between items-center">
                  {data?.length !== 0 && (
                    <div className="font-inter text-xs text-center whitespace-nowrap">
                      {`${loadedPages} / ${totalPages}`} pages
                    </div>
                  )}
                  {totalPages !== 0 && (
                    <div className="font-inter text-xs text-center whitespace-nowrap">
                      {Math.round((loadedPages / totalPages) * 100)}%
                    </div>
                  )}
                  {totalPages === 0 && (
                    <div className="w-full font-inter text-xs text-center whitespace-nowrap">
                      processing...
                    </div>
                  )}
                </div>
                <Progress
                  className="w-[320px]"
                  value={
                    totalPages === 0 ? 0 : (loadedPages / totalPages) * 100
                  }
                />
                <div className="font-light text-lg text-black uppercase">
                  {totalPages === 0
                    ? "loading room data"
                    : "generating presentation"}
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex flex-col gap-3 justify-center items-center">
                <LoaderCircle
                  strokeWidth={1}
                  size={48}
                  className="animate-spin"
                />
                <div className="font-light text-lg text-black uppercase">
                  loading room data
                </div>
              </div>
            )}
          </div>
        )}
        {presentationModeStatus === "loaded" && pageURL && (
          <Image
            key={pages[actualPage]?.pageId}
            src={pageURL}
            alt="A frame image"
            className="object-contain w-auto h-full"
            layout="fullWidth"
          />
        )}
      </div>
    </div>
  );
};
