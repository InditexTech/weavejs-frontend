// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Divider } from "../overlay/divider";
import { Database } from "lucide-react";
import { useIsRoomReady } from "../hooks/use-is-room-ready";
import { useWeave } from "@inditextech/weave-react";

export const MemoryToolbar = () => {
  const [usedJSHeapMemory, setUsedJSHeapMemory] = React.useState<number>(0);
  const [totalJSHeapMemory, setTotalJSHeapMemory] = React.useState<number>(0);

  const isRoomSwitching = useWeave((state) => state.room.switching);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      const usedJSHeap = Math.round(
        (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory.usedJSHeapSize / 1024 / 1024,
      );
      setUsedJSHeapMemory(usedJSHeap);
      const totalJSHeap = Math.round(
        (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory.totalJSHeapSize / 1024 / 1024,
      );
      setTotalJSHeapMemory(totalJSHeap);
    }, 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const isRoomReady = useIsRoomReady();

  if (!isRoomReady || isRoomSwitching) {
    return null;
  }

  return (
    <>
      <Divider className="h-[20px]" />
      <Database strokeWidth={1} size={20} />
      <div className="flex flex-col gap-8 justify-center items-center">
        <div className="flex gap-3 justify-center items-center">
          <Progress
            className="w-[120px]"
            value={(usedJSHeapMemory / totalJSHeapMemory) * 100}
          />
          <div className="flex justify-between items-center">
            <div className="font-mono text-xs text-center whitespace-nowrap">
              {`${usedJSHeapMemory} / ${totalJSHeapMemory} MB`}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
