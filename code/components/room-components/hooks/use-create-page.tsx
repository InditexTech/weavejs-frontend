// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { CreatedPage, postPage } from "@/api/pages/post-page";
import { useCollaborationRoom } from "@/store/store";

type UseCreatePageProps = {
  roomId: string | null | undefined;
  toastRef: React.RefObject<string | number | null>;
  onCreated: (page: CreatedPage) => void;
};

export const useCreatePage = ({
  roomId,
  toastRef,
  onCreated,
}: Readonly<UseCreatePageProps>) => {
  const setRoomPageAdding = useCollaborationRoom(
    (state) => state.setRoomPageAdding,
  );

  return useMutation({
    mutationFn: async (params: { name: string; thumbnail: string }) => {
      if (!roomId) {
        throw new Error("Room ID is required to create a page");
      }

      setRoomPageAdding(true);

      return await postPage(roomId, params);
    },
    onSettled: () => {
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
      }
    },
    onSuccess: onCreated,
    onError: (error) => {
      console.error("Error creating page", error);
    },
  });
};
