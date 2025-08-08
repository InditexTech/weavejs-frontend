// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { TASKS_TYPES_MAP } from "./constants";

export const AITasks = () => {
  const tasks = useCollaborationRoom((state) => state.tasks);

  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.aiTasks) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-[24px] py-[27px] bg-white flex justify-between items-center border-b border-[#c9c9c9]">
        <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
          <SidebarSelector title="Tasks" />
        </div>
        <div className="flex justify-end items-center gap-4">
          <button
            className="cursor-pointer flex justify-center items-center w-[20px] h-[40px] text-center bg-transparent hover:text-[#c9c9c9]"
            onClick={() => {
              setSidebarActive(null);
            }}
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
      <ScrollArea className="w-full h-[calc(100%-95px)] overflow-auto">
        <div className="flex flex-col gap-2 w-full">
          <div
            className="grid grid-cols-1 gap-2 w-full p-[24px]"
            onDragStart={(e) => {
              if (e.target instanceof HTMLImageElement) {
                window.weaveDragImageURL = e.target.src;
              }
            }}
          >
            {tasks.length === 0 && (
              <div className="col-span-2 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                <b className="font-normal text-[18px]">No tasks</b>
              </div>
            )}
            {tasks.length > 0 &&
              tasks.map((task) => {
                const taskId = task.jobId;

                return (
                  <div
                    key={taskId}
                    className="group w-full h-[100px] bg-light-background-1 object-cover cursor-pointer border border-zinc-200 relative p-3"
                  >
                    <div className="w-[320px] flex flex-col gap-1">
                      <div className="font-inter text-xs text-foreground">
                        {TASKS_TYPES_MAP[task.type]}
                      </div>
                      <div className="font-inter text-sm">{task.status}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
