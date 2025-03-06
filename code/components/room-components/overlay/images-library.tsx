"use client";

import React from "react";
import { ImagePlus } from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import { useCollaborationRoom } from "@/store/store";

export const ImagesLibrary = () => {
  const instance = useWeave((state) => state.instance);

  const imagesLibraryVisible = useCollaborationRoom((state) => state.images.library.visible);

  if (!instance) {
    return null;
  }

  if (!imagesLibraryVisible) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-full h-full">
      <div className="w-full font-title-xs p-4 border-b border-light-border-3 bg-light-background-2 flex justify-between items-center">
        <div className="flex justify-between items-center">Images Library</div>
      </div>
      <div className="flex flex-col gap-2 w-full h-[calc(100%-53px)]">
        <div
          className="grid grid-cols-2 gap-2 w-full weaveDraggable p-4"
          onDragStart={(e) => {
            if (e.target instanceof HTMLImageElement) {
              window.weaveDragImageURL = e.target.src;
            }
          }}
        >
          <button
            onClick={() => {
              if (instance) {
                instance.triggerAction("imageTool");
              }
            }}
            className="cursor-pointer w-full h-[100px] bg-light-background-1 flex justify-center items-center bg-light-background-2 hover:bg-light-background-3"
          >
            <ImagePlus />
          </button>
          <div className="w-full h-[100px] bg-light-background-1 object-cover cursor-pointer">
            <img
              className="w-full h-full object-cover"
              draggable="true"
              src="https://lostintokyo.co.uk/content/uploads/sites/3/2017/02/test-image-7MB.jpg"
            />
          </div>
          <div className="w-full h-[100px] bg-light-background-1 object-cover cursor-pointer">
            <img
              className="w-full h-full object-cover"
              draggable="true"
              src="https://e7.pngegg.com/pngimages/479/224/png-clipart-rick-and-morty-rick-sanchez-rick-and-morty-season-3-adult-swim-rick-and-morty-season-2-episode-rick-and-morty-grass-fictional-character.png"
            />
          </div>
          <div className="w-full h-[100px] bg-light-background-1 object-cover cursor-pointer">
            <img
              className="w-full h-full object-cover"
              draggable="true"
              src="https://wallpapers.com/images/high/plain-pickle-rick-green-e28b2xwc7s3w9pz7.webp"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
