// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useCollaborationRoom } from "@/store/store";
import { PagesGrid } from "./pages.grid";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

export const PagesGridView = () => {
  const viewType = useCollaborationRoom((state) => state.viewType);
  const pagesGridVisible = useCollaborationRoom(
    (state) => state.pages.gridVisible,
  );
  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
  );

  return (
    <div
      className={cn(
        "absolute bg-white left-0 right-0 bottom-[40px] top-[54px] border-t-[0.5px] border-[#c9c9c9] z-[11]",
        {
          ["hidden"]: !pagesGridVisible,
          ["block"]: pagesGridVisible,
          ["top-[54px]"]: viewType === "floating",
          ["top-0"]: viewType === "fixed",
        },
      )}
    >
      <div className="flex justify-between items-center p-5 border-b border-[0.5px] border-[#c9c9c9]">
        <div className="font-light text-2xl">Pages</div>
        <button
          className="cursor-pointer bg-transparent hover:text-[#666666]"
          onClick={() => {
            setPagesGridVisible(false);
          }}
        >
          <XIcon size={24} strokeWidth={1} />
        </button>
      </div>
      <PagesGrid />
    </div>
  );
};
