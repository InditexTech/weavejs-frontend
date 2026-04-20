// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { getRoom } from "@/api/get-room";
import { getPages } from "@/api/pages/get-pages";
import { postPage } from "@/api/pages/post-page";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { useCollaborationRoom } from "@/store/store";

export const useManageRoomPages = (roomId: string | undefined) => {
  const [status, setStatus] = React.useState<
    "loading" | "loaded" | "creating" | "managed" | "error"
  >("loading");

  const setActualPage = useCollaborationRoom(
    (state) => state.setPagesActualPage,
  );
  const setActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );
  const setRoomStatus = useCollaborationRoom((state) => state.setRoomStatus);

  const {
    data: roomData,
    fetchStatus: roomDataStatus,
    isFetched: roomDataIsFetched,
  } = useQuery({
    queryKey: ["roomData", roomId ?? ""],
    queryFn: () => {
      return getRoom(roomId ?? "");
    },
    initialData: undefined,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!roomId,
  });

  const { data: roomPages, isFetched: pagesIsFetched } = useQuery({
    queryKey: ["getPages", roomId ?? ""],
    queryFn: () => {
      return getPages(roomId ?? "", "active", 0, 10);
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!roomId,
  });

  const createPage = useMutation({
    mutationFn: async (params: {
      pageId: string;
      name: string;
      thumbnail: string;
    }) => {
      if (!roomId) {
        throw new Error("Room ID is required to create a page");
      }

      return await postPage(roomId, params);
    },
    onSuccess: (_, { pageId }) => {
      setStatus("managed");
      setActualPage(1);
      setActualPageId(pageId);
    },
    onError: (error) => {
      console.error("Error creating page", error);
      setStatus("error");
    },
  });

  React.useEffect(() => {
    if (roomDataStatus === "fetching" && !roomDataIsFetched) {
      setRoomStatus("loading");
    } else if (roomDataStatus === "idle" && roomDataIsFetched && roomData) {
      setRoomStatus("loaded");
    }
  }, [status, roomDataStatus, roomDataIsFetched, roomData, setRoomStatus]);

  React.useEffect(() => {
    if (roomDataIsFetched && pagesIsFetched) {
      setStatus("loaded");
    }
  }, [roomDataIsFetched, pagesIsFetched]);

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    if (roomPages?.items?.length > 0) {
      setRoomStatus("loaded");
      setActualPage(1);
      setActualPageId(roomPages.items[0].pageId);
      setStatus("managed");
    }
    if (roomData && roomPages?.items?.length === 0 && status === "loaded") {
      createPage.mutate({
        pageId: uuidv4(),
        name: "New page",
        thumbnail: "",
      });
      setStatus("creating");
    }
    if (!roomData && roomPages?.items?.length === 0 && status === "loaded") {
      createPage.mutate({
        pageId: uuidv4(),
        name: "New page",
        thumbnail: "",
      });
      setStatus("creating");
    }
  }, [
    status,
    roomData,
    roomPages,
    createPage,
    roomId,
    setActualPage,
    setActualPageId,
    setRoomStatus,
  ]);

  return status === "managed";
};
