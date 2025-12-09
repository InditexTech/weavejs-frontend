// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { topElementVariants } from "./variants";
import { ConnectedUsers } from "../connected-users";
import { ZoomToolbar } from "./zoom-toolbar";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { LlmSetupDialog } from "./llm-setup";

export function RoomHeaderRight() {
  const selectionActive = useWeave((state) => state.selection.active);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const showUI = useCollaborationRoom((state) => state.ui.show);

  if (!showUI) {
    return null;
  }

  return (
    <>
      {![
        WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].includes(weaveConnectionStatus as any) && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={topElementVariants}
          className={cn(
            "w-auto block z-1 flex gap-1 justify-center items-center",
            {
              ["pointer-events-none"]: selectionActive,
              ["pointer-events-auto"]: !selectionActive,
            }
          )}
        >
          <div className="w-full bg-white flex justify-between items-center gap-0 p-[5px] px-[12px] 2xl:py-[12px] 2xl:px-[24px] border-b-[0.5px] border-[#c9c9c9]">
            <div className="w-full flex justify-end items-center gap-[16px]">
              <div className="w-full flex justify-start items-center gap-[16px]">
                {/* <ConnectionStatus
                  weaveConnectionStatus={weaveConnectionStatus}
                /> */}
                <div className="max-w-[320px]">
                  <ConnectedUsers />
                </div>
              </div>
              <div className="hidden 2xl:flex justify-end items-center gap-[16px]">
                <ZoomToolbar />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <LlmSetupDialog />
    </>
  );
}
