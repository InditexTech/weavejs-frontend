"use client";

import React from "react";
import { useWeave } from "@inditextech/weavejs-react";
import { useCollaborationRoom } from "@/store/store";
import { Pantone } from "./pantone";

type PantoneElement = {
  id: string;
  color: string;
};

export const PantonesLibrary = () => {
  const instance = useWeave((state) => state.instance);

  const pantonesLibraryVisible = useCollaborationRoom(
    (state) => state.pantones.library.visible
  );

  const commonPantones: PantoneElement[] = React.useMemo(() => {
    return [
      { id: "1", color: "#28282D" },
      { id: "2", color: "#00656B" },
      { id: "3", color: "#D79D00" },
      { id: "4", color: "#3073B7" },
      { id: "5", color: "#953640" },
      { id: "6", color: "#C5AECF" },
      { id: "7", color: "#46295A" },
      { id: "8", color: "#79797C" },
    ];
  }, []);

  if (!instance) {
    return null;
  }

  if (!pantonesLibraryVisible) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-full h-full">
      <div className="w-full font-title-xs p-1 border-b border-zinc-200 bg-white flex justify-between items-center">
        <div className="flex justify-between  h-8 font-noto-sans-mono font-light items-center text-md pl-2">
          Some Pantones
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full h-[calc(100%-50px)]">
        <div
          className="grid grid-cols-1 gap-2 w-full weaveDraggable p-4"
          onDragStart={(e) => {
            if (e.target instanceof HTMLDivElement) {
              window.pantoneDragColor = e.target.dataset.pantonecolor;
            }
          }}
        >
          {commonPantones.map((ele) => {
            return <Pantone key={ele.id} color={ele.color} />;
          })}
        </div>
      </div>
    </div>
  );
};
