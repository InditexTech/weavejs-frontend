// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { getPages } from "@/api/pages/get-pages";
import { postPage } from "@/api/pages/post-page";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useCollaborationRoom } from "@/store/store";

export const useManageRoomPages = (roomId: string | undefined) => {
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "loaded" | "creating" | "managed" | "error"
  >("idle");

  const setActualPage = useCollaborationRoom(
    (state) => state.setPagesActualPage,
  );
  const setActualPageId = useCollaborationRoom(
    (state) => state.setPagesActualPageId,
  );
  const setRoomStatus = useCollaborationRoom((state) => state.setRoomStatus);

  const { data: roomPages, isFetched: pagesIsFetched } = useQuery({
    queryKey: ["getPagesInit", roomId ?? ""],
    queryFn: () => {
      setStatus("loading");
      return getPages(roomId ?? "", "active", 0, 10);
    },
    initialData: undefined,
    refetchOnWindowFocus: false,
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

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const queryKey = ["getPagesInit"];
    queryClient.invalidateQueries({ queryKey });
    setActualPage(0);
    setActualPageId(null);
    setStatus("idle");
  }, [roomId, setActualPage, setActualPageId, queryClient]);

  React.useEffect(() => {
    if (!pagesIsFetched) {
      setStatus("loading");
      setRoomStatus("loading");
    }
    if (pagesIsFetched) {
      setStatus("loaded");
      setRoomStatus("loaded");
    }
  }, [pagesIsFetched, setRoomStatus]);

  const pages = React.useMemo(() => {
    if (roomPages && pagesIsFetched) {
      return roomPages.items;
    }
    return [];
  }, [roomPages, pagesIsFetched]);

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    if (status === "idle") {
      return;
    }

    if (pages.length > 0 && status === "loaded") {
      setActualPage(1);
      setActualPageId(pages[0].pageId);
      setStatus("managed");
    }
    if (pages.length === 0 && status === "loaded") {
      createPage.mutate({
        pageId: uuidv4(),
        name: "New page",
        thumbnail: "",
      });
      setStatus("creating");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    status,
    pages,
    createPage,
    setActualPage,
    setActualPageId,
    setRoomStatus,
  ]);

  return status === "managed";
};
