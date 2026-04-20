// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useCollaborationRoom } from "@/store/store";
import { PagesList } from "./pages.list";
import { cn } from "@/lib/utils";

export const PagesListView = () => {
  const pagesListVisible = useCollaborationRoom(
    (state) => state.pages.listVisible,
  );

  return (
    <div
      className={cn(
        "absolute bg-white left-0 right-0 bottom-[40px] border-t-[0.5px] border-[#c9c9c9] z-[10]",
        {
          ["hidden"]: !pagesListVisible,
          ["block"]: pagesListVisible,
        },
      )}
    >
      <PagesList />
    </div>
  );
};
