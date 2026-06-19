// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { Divider } from "../room-components/overlay/divider";
import { ConnectedUsers } from "../room-components/connected-users";
import { ConnectionStatus } from "../room-components/connection-status";
import { useBreakpoint } from "../room-components/overlay/hooks/use-breakpoint";
import { AIToolbar } from "../room-components/toolbars/ai.toolbar";
import { ZoomToolbar } from "../room-components/toolbars/zoom.toolbar";
import { PagesToolbar } from "../room-components/toolbars/pages.toolbar";
import { UIToolbar } from "../room-components/toolbars/ui.toolbar";
import { useWeave } from "@inditextech/weave-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useIAChat } from "@/store/ia-chat";
import { cn } from "@/lib/utils";
import { PagesGridView } from "../room-components/pages-library/pages.grid.view";
import { PagesListView } from "../room-components/pages-library/pages.list.view";
import { ExportToolbar } from "../room-components/toolbars/export.toolbar";
import { Badge } from "../ui/badge";
import { UISetupToolbar } from "../room-components/toolbars/ui-setup.toolbar";
import { PresentationToolbar } from "../room-components/toolbars/presentation.toolbar";
import { MemoryToolbar } from "../room-components/toolbars/memory.toolbar";
import { GroupsContextToolbar } from "../room-components/toolbars/groups-context.toolbar";
import { AsyncAssetsToolbar } from "../room-components/toolbars/async-assets.toolbar";

export const RoomFooter = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const viewType = useCollaborationRoom((state) => state.viewType);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);

  const aiEnabled = useIAChat((state) => state.enabled);

  const breakpoint = useBreakpoint();

  return (
    <>
      {WEAVE_STORE_CONNECTION_STATUS.CONNECTED === weaveConnectionStatus &&
        !isRoomSwitching && (
          <>
            <PagesGridView key="pagesGrid" />
            <PagesListView key="pagesList" />
          </>
        )}
      <section
        className={cn(
          "absolute bottom-0 left-0 right-0 w-full h-[40px] border-t-[0.5px] border-[#c9c9c9] flex gap-5 justify-between items-center px-[24px]",
          {
            ["px-[16px]"]: viewType === "floating",
            ["px-[24px]"]: viewType === "fixed",
          },
        )}
      >
        <div className="flex justify-start items-center gap-3">
          <ConnectionStatus />
          {roomInfo?.room?.status === "archived" && (
            <>
              <Divider className="h-[20px]" />
              <div className="flex gap-1 justify-start items-center">
                {roomInfo?.room?.status === "archived" && (
                  <Badge variant="destructive">archived</Badge>
                )}
              </div>
            </>
          )}
          <ConnectedUsers />
          <UISetupToolbar />
          <MemoryToolbar />
          <AsyncAssetsToolbar />
        </div>
        <div className="flex justify-end items-center gap-3">
          {aiEnabled && <AIToolbar />}
          <GroupsContextToolbar />
          <ExportToolbar />
          <PresentationToolbar />
          <ZoomToolbar />
          <PagesToolbar />
          {["2xl"].includes(breakpoint) && <UIToolbar />}
        </div>
      </section>
    </>
  );
};
