// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { getPage } from "@/api/pages/get-page";

export const useLoadPage = () => {
  const instance = useWeave((state) => state.instance);

  const roomId = useCollaborationRoom((state) => state.room);

  const actualPageId = useCollaborationRoom(
    (state) => state.pages.actualPageId,
  );

  const setActualPageElement = useCollaborationRoom(
    (state) => state.setPagesActualPageElement,
  );

  const { data: roomPage, isFetched: pageIsFetched } = useQuery({
    queryKey: ["getPage", roomId ?? "", actualPageId ?? ""],
    queryFn: () => {
      return getPage(roomId ?? "", actualPageId ?? "");
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!roomId && !!actualPageId,
  });

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (roomPage && pageIsFetched) {
      setActualPageElement(roomPage);
    }
  }, [instance, roomPage, pageIsFetched, setActualPageElement]);
};
