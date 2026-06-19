// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { WeaveStateManipulation } from "@inditextech/weave-sdk";
import { useWeave } from "@inditextech/weave-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postPage } from "@/api/pages/post-page";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";
import { useCollaborationRoom } from "@/store/store";
import { getRoomData } from "@/components/utils/data";

type UseCreatePageFromTemplateProps = {
  roomId: string;
};

export const useCreatePageFromTemplate = (
  hookParams: Readonly<UseCreatePageFromTemplateProps>,
) => {
  const createToastRef = React.useRef<string | number | null>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const pagesAmount = useCollaborationRoom((state) => state.pages.amount);
  const setPagesActualPage = useCollaborationRoom(
    (state) => state.setPagesActualPage,
  );
  const setPagesActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );
  const setRoomDataStatus = useCollaborationRoom(
    (state) => state.setRoomDataStatus,
  );
  const setRoomImageFallback = useCollaborationRoom(
    (state) => state.setRoomImageFallback,
  );

  const queryClient = useQueryClient();

  const handleSwitchPage = React.useCallback(
    async (pageIndex: number, pageId: string) => {
      if (!instance) return;

      if (!room) return;

      const queryKeyPages = ["getPages", hookParams.roomId];
      queryClient.invalidateQueries({ queryKey: queryKeyPages });

      const queryKey = ["getPagesInfinite", hookParams.roomId];
      queryClient.invalidateQueries({ queryKey });

      const store = instance.getStore() as WeaveStoreAzureWebPubsub;

      try {
        const offlineData =
          await WeaveStoreAzureWebPubsub.roomHasIndexedDbData(pageId);

        if (!offlineData) {
          const { roomData: data } = await getRoomData(
            queryClient,
            room,
            pageId,
            setRoomDataStatus,
            setRoomImageFallback,
          );
          store.switchToRoom(pageId, data);
        } else {
          store.switchToRoom(pageId, undefined);
        }
        // eslint-disable-next-line no-empty
      } catch {
        store.switchToRoom(pageId, undefined);
      }

      setPagesActualPage(pageIndex);
      setPagesActualPageId(pageId);
    },
    [
      instance,
      room,
      queryClient,
      hookParams.roomId,
      setPagesActualPage,
      setPagesActualPageId,
    ],
  );

  const createPage = useMutation({
    mutationFn: async (params: {
      pageId: string;
      name: string;
      thumbnail: string;
      templateId: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      templateData: any;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const boundingBox = WeaveStateManipulation.getNodesBoundingBox(
        params.templateData,
      );

      const payloadParams = {
        pageId: params.pageId,
        name: params.name,
        thumbnail: params.thumbnail,
        templateId: params.templateId,
        target: {
          id: "mainLayer",
          position: {
            x: -1 * (boundingBox.width / 2),
            y: -1 * (boundingBox.height / 2),
          },
        },
      };
      return await postPage(hookParams.roomId, payloadParams);
    },
    onSettled: () => {
      if (createToastRef.current) {
        toast.dismiss(createToastRef.current);
      }
    },
    onSuccess: async (_, { pageId }) => {
      await handleSwitchPage(pagesAmount + 1, pageId);
      toast.success("Template materialized on the page successfully");
    },
    onError: () => {
      toast.error("Error creating page");
    },
  });

  const createPageFromTemplate = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (templateId: string, templateData: any) => {
      createToastRef.current = toast.loading("Creating page...", {
        duration: Infinity,
      });
      createPage.mutate({
        pageId: `${hookParams.roomId}-${uuidv4()}`,
        name: "New page",
        thumbnail: "",
        templateId,
        templateData,
      });
    },
    [],
  );

  return {
    createPageFromTemplate,
  };
};
