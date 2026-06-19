// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Divider } from "../overlay/divider";
import { BookImage } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const AsyncAssetsToolbar = () => {
  const asyncElementsLoaded = useWeave((state) => state.asyncElements.loaded);
  const asyncElementsTotal = useWeave((state) => state.asyncElements.total);
  const asyncElementsState = useWeave((state) => state.asyncElements.state);

  const isRoomSwitching = useWeave((state) => state.room.switching);

  const isRoomReady = useIsRoomReady();

  if (!isRoomReady || isRoomSwitching || asyncElementsState == "loaded") {
    return null;
  }

  return (
    <>
      <Divider className="h-[20px]" />
      <BookImage strokeWidth={1} size={20} />
      <div className="flex gap-3 justify-center items-center">
        <div className="flex justify-between items-center">
          <div className="font-inter text-xs text-center whitespace-nowrap">
            {Math.round((asyncElementsLoaded / asyncElementsTotal) * 100)}%
          </div>
        </div>
        <Progress
          className="w-[120px]"
          value={(asyncElementsLoaded / asyncElementsTotal) * 100}
        />
        <div className="flex justify-between items-center">
          <div className="font-inter text-xs text-center whitespace-nowrap">
            {`${asyncElementsLoaded} / ${asyncElementsTotal}`}
          </div>
        </div>
      </div>
    </>
  );
};
