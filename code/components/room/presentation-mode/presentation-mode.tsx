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
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  XIcon,
} from "lucide-react";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { useWeave } from "@inditextech/weave-react";
import { getAllPages } from "@/api/pages/get-all-pages";
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
  const presentationUIVisible = useCollaborationRoom(
    (state) => state.presentation.ui.visible,
  );
  const presentationInstanceId = useCollaborationRoom(
    (state) => state.presentation.instanceId,
  );
  const presentationModeVisible = useCollaborationRoom(
    (state) => state.presentation.visible,
  );
  const presentationModeStatus = useCollaborationRoom(
    (state) => state.presentation.status,
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
  const setPresentationUIVisible = useCollaborationRoom(
    (state) => state.setPresentationUiVisible,
  );

  useHotkey(
    { key: "H", mod: false, shift: true },
    () => {
      setPresentationUIVisible(!presentationUIVisible);
    },
    {
      enabled: presentationModeVisible,
    },
  );

  useHotkey(
    { key: "Escape", mod: false, shift: false },
    () => {
      if (presentationModeVisible) {
        setPresentationMode(false);
      }
    },
    {
      enabled: presentationModeVisible,
    },
  );

  useHotkey(
    { key: "ArrowLeft", mod: false, shift: false },
    () => {
      if (presentationModeVisible && presentationModeStatus === "loaded") {
        setActualPage((prev) => (prev - 1 < 0 ? 0 : prev - 1));
      }
    },
    {
      enabled: presentationModeVisible,
    },
  );

  useHotkey(
    { key: "ArrowRight", mod: false, shift: false },
    () => {
      if (presentationModeVisible && presentationModeStatus === "loaded") {
        setActualPage((prev) =>
          prev + 1 >= totalPages ? totalPages - 1 : prev + 1,
        );
      }
    },
    {
      enabled: presentationModeVisible,
    },
  );

  useHotkey(
    { key: "ArrowLeft", mod: false, shift: true },
    () => {
      if (presentationModeVisible && presentationModeStatus === "loaded") {
        setActualPage(0);
      }
    },
    {
      enabled: presentationModeVisible,
    },
  );

  useHotkey(
    { key: "ArrowRight", mod: false, shift: true },
    () => {
      if (presentationModeVisible && presentationModeStatus === "loaded") {
        setActualPage(totalPages - 1);
      }
    },
    {
      enabled: presentationModeVisible,
    },
  );

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
    onSuccess() {
      setPresentationStatus("loaded");
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
      setPresentationPagesStatus(0);
      setLoadPages(false);
    }

    if (presentationModeVisible) {
      setLoadPages(true);
    }

    if (actualRoomId !== pageInfo?.roomId && !presentationInstanceId) {
      setActualPage(0);
      setPresentationStatus("idle");
      setPresentationPagesStatus(0);
      setLoadPages(false);
      setActualRoomId(pageInfo.roomId);
    }
  }, [
    presentationInstanceId,
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

      if (!exportRect) {
        return;
      }

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

  if (!presentationModeVisible || presentationModeStatus !== "loaded") {
    return null;
  }

  return (
    <div className="fixed z-[100] top-0 left-0 right-0 bottom-0 bg-white flex flex-col gap-3 justify-center items-start">
      {presentationUIVisible && (
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
      )}
      {loadPages && !isLoading && presentationModeStatus === "loaded" && (
        <>
          {presentationUIVisible && (
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
        </>
      )}
      <div className="w-full h-full flex justify-center items-center bg-black">
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
