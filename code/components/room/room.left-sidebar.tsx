// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { ElementsTree } from "../room-components/elements-tree/elements-tree";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { RoomHeaderShadowDom } from "../room-components/overlay/room-header-shadow-dom";
import { RoomHeader } from "./room.header";
import { useWeave } from "@inditextech/weave-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { cn } from "@/lib/utils";
import { RoomPageSelector } from "./room.page-selector";

type RoomLeftSidebarProps = {
  inShadowDom: boolean;
};

export const RoomLeftSidebar = ({
  inShadowDom,
}: Readonly<RoomLeftSidebarProps>) => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const showLeftSidebarFloating = useCollaborationRoom(
    (state) => state.showLeftSidebarFloating,
  );

  const viewType = useCollaborationRoom((state) => state.viewType);
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled,
  );

  // if (
  //   WEAVE_STORE_CONNECTION_STATUS.CONNECTED !== weaveConnectionStatus &&
  //   !roomSwitching
  // ) {
  //   return null;
  // }

  if (viewType === "floating" && !showLeftSidebarFloating) {
    return null;
  }

  return (
    <section
      className={cn("", {
        ["top-0 left-0 bottom-0 h-[calc(100%-40px)] w-[400px]"]:
          viewType === "fixed",
        ["top-[62px] left-[62px] w-[400px] h-[calc(100%-54px-16px-40px)] drop-shadow"]:
          viewType === "floating" && showLeftSidebarFloating,
        ["fixed pointer-events-auto bg-white border-r border-r-[#c9c9c9]"]:
          !imageCroppingEnabled &&
          ((viewType === "floating" && showLeftSidebarFloating) ||
            viewType === "fixed"),
        ["hidden pointer-events-none"]:
          imageCroppingEnabled ||
          (viewType === "floating" && !showLeftSidebarFloating),
      })}
    >
      {inShadowDom && viewType === "fixed" && <RoomHeaderShadowDom />}
      {!inShadowDom && viewType === "fixed" && <RoomHeader />}
      {WEAVE_STORE_CONNECTION_STATUS.CONNECTED !== weaveConnectionStatus &&
        !isRoomSwitching && (
          <div className="w-full h-full flex justify-center items-center font-inter text-lg uppercase">
            {/* disconnected */}
          </div>
        )}
      {WEAVE_STORE_CONNECTION_STATUS.CONNECTED === weaveConnectionStatus &&
        isRoomSwitching && (
          <div className="w-full h-full flex justify-center items-center font-inter text-lg uppercase">
            {/* switching page */}
          </div>
        )}
      {viewType === "fixed" && <RoomPageSelector />}
      {WEAVE_STORE_CONNECTION_STATUS.CONNECTED === weaveConnectionStatus &&
        !isRoomSwitching && <ElementsTree key={SIDEBAR_ELEMENTS.nodesTree} />}
    </section>
  );
};
