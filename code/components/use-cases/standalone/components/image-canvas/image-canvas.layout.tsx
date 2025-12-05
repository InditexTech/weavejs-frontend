// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useWeave, useWeaveEvents } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WEAVE_STORE_CONNECTION_STATUS,
} from "@inditextech/weave-types";
import { Tools } from "../overlays/tools";
import { Zoom } from "../overlays/zoom";
import { WeaveStageZoomPlugin } from "@inditextech/weave-sdk";
import { useStandaloneUseCase } from "../../store/store";
import { SaveIcon, XIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { putStandaloneInstanceImageData } from "@/api/standalone/put-standalone-instance-image-data";
import { uint8ToBase64 } from "../../utils/utils";
import { ScaleLoader } from "react-spinners";

export const ImageCanvasLayout = () => {
  const instance = useWeave((state) => state.instance);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const status = useWeave((state) => state.status);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const saving = useStandaloneUseCase((state) => state.actions.saving);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const setManagingImageId = useStandaloneUseCase(
    (state) => state.setManagingImageId
  );
  const setSaving = useStandaloneUseCase((state) => state.setSaving);
  const setCommentsShow = useStandaloneUseCase(
    (state) => state.setCommentsShow
  );

  useWeaveEvents();

  React.useEffect(() => {
    if (!instance) return;

    if (status !== WEAVE_INSTANCE_STATUS.RUNNING) return;

    if (!roomLoaded) return;

    if (status === WEAVE_INSTANCE_STATUS.RUNNING) {
      instance.triggerAction("fitToScreenTool", {
        previousAction: "selectionTool",
      });

      const weaveStageZoomPlugin =
        instance.getPlugin<WeaveStageZoomPlugin>("stageZoom");

      if (weaveStageZoomPlugin) {
        weaveStageZoomPlugin.setZoom(1);
      }
    }
  }, [instance, status, roomLoaded]);

  const mutationSave = useMutation({
    mutationFn: async (data: string) => {
      if (!managingImageId) {
        throw new Error("No managing image id");
      }

      return await putStandaloneInstanceImageData(
        instanceId,
        managingImageId,
        data
      );
    },
    onMutate: () => {
      setSaving(true);
    },
    onSettled: () => {
      setSaving(false);
    },
    onError: () => {
      setSaving(false);
    },
  });

  return (
    <>
      <div
        id="weave"
        tabIndex={0}
        style={{
          background: "#d6d6d6",
        }}
        className={cn("w-full h-full overflow-hidden", {
          ["pointer-events-none"]:
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
            status !== WEAVE_INSTANCE_STATUS.RUNNING ||
            !roomLoaded,
          ["pointer-events-auto"]:
            status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded,
        })}
      />
      {weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTED && (
        <>
          <div className="absolute top-5 right-5 flex justify-end gap-1">
            <Zoom />
          </div>
          <Tools />
          <div className="absolute top-5 left-5 flex justify-end items-center gap-1">
            <div className="font-inter text-xs bg-white px-5 py-3">
              <span className="uppercase">IMAGE:</span> {managingImageId}
            </div>
            <button
              className="group cursor-pointer bg-white disabled:cursor-default hover:disabled:bg-transparent px-3 h-[40px] hover:text-[#c9c9c9] flex gap-3 justify-center items-center"
              onClick={() => {
                if (!instance) return;

                const snapshot: Uint8Array<ArrayBufferLike> = instance
                  .getStore()
                  .getStateSnapshot();

                mutationSave.mutate(uint8ToBase64(snapshot));
              }}
            >
              <SaveIcon strokeWidth={1} size={16} /> SAVE
            </button>
            <button
              className="group cursor-pointer bg-white disabled:cursor-default hover:disabled:bg-transparent px-3 h-[40px] hover:text-[#c9c9c9] flex gap-3 justify-center items-center"
              onClick={() => {
                setManagingImageId(null);
                setCommentsShow(false);
              }}
            >
              <XIcon strokeWidth={1} size={16} /> CLOSE
            </button>
          </div>
          {saving && (
            <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/20 flex flex-col justify-center items-center">
              <div className="flex flex-col gap-1 justify-center items-center bg-white p-5">
                <ScaleLoader />
                <div className="font-inter text-xl">saving</div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
