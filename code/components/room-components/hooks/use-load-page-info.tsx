// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from "@tanstack/react-query";
import { getPage } from "@/api/pages/get-page";

export const useLoadPageInfo = (roomId: string, pageId: string) => {
  const { data, isFetching } = useQuery({
    queryKey: ["getPage", roomId, pageId],
    queryFn: () => {
      return getPage(roomId, pageId);
    },
    initialData: undefined,
    staleTime: 0,
    retry: false,
    enabled: !!roomId && !!pageId,
  });

  return { data, isFetching };
};
