// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { SaveIcon } from "lucide-react";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { useStandaloneUseCase } from "../../store/store";
import { useMutation } from "@tanstack/react-query";
import { putStandaloneInstanceImageData } from "@/api/standalone/put-standalone-instance-image-data";
import { uint8ToBase64 } from "../../utils/utils";

export function ImageToolbar() {
  const instance = useWeave((state) => state.instance);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );
  const instanceLoading = useStandaloneUseCase(
    (state) => state.instanceLoading,
  );
  const setSaving = useStandaloneUseCase((state) => state.setSaving);

  const mutationSave = useMutation({
    mutationFn: async (data: string) => {
      if (!managingImageId) {
        throw new Error("No managing image id");
      }

      return await putStandaloneInstanceImageData(
        instanceId,
        managingImageId,
        data,
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
      <ToolbarButton
        icon={<SaveIcon size={20} strokeWidth={1} />}
        onClick={() => {
          if (!instance) return;

          const snapshot: Uint8Array<ArrayBufferLike> = instance
            .getStore()
            .getStateSnapshot();

          mutationSave.mutate(uint8ToBase64(snapshot));
        }}
        disabled={instanceLoading}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Save</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
    </>
  );
}
