// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Trash, X } from "lucide-react";
import {
  WeaveStateElement,
  WeaveElementAttributes,
  WeaveElementInstance,
} from "@inditextech/weave-types";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { WeaveImageNode } from "@inditextech/weave-sdk";

function isRelativeUrl(url: string) {
  try {
    new URL(url);
    return false;
  } catch {
    return true;
  }
}

export const ImagesLibrary = () => {
  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);

  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const appImages = React.useMemo(() => {
    function extractImages(
      images: WeaveStateElement[],
      node: WeaveStateElement
    ) {
      if (node.props && node.props.nodeType === "image" && node.props.imageId) {
        images.push(node);
      }
      if (node.props && node.props.children) {
        for (const child of node.props.children) {
          extractImages(images, child);
        }
      }
    }

    const mainStateProps: WeaveElementAttributes = appState.weave
      .props as WeaveElementAttributes;

    const mainStateChildren: WeaveStateElement[] | undefined =
      mainStateProps?.children;
    const mainLayerElement: WeaveStateElement | undefined =
      mainStateChildren?.find((child: WeaveStateElement) => {
        return child.key === "mainLayer";
      });

    const images: WeaveStateElement[] = [];

    if (typeof mainLayerElement === "undefined") {
      return images;
    }

    extractImages(images, mainLayerElement);

    return images;
  }, [appState]);

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.images) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-[24px] py-[27px] bg-white flex justify-between items-center border-b border-[#c9c9c9]">
        <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
          <SidebarSelector title="Images" />
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
            className="grid grid-cols-2 gap-2 w-full weaveDraggable p-[24px]"
            onDragStart={(e) => {
              if (e.target instanceof HTMLImageElement) {
                window.weaveDragImageURL = e.target.src;
              }
            }}
          >
            {appImages.length === 0 && (
              <div className="col-span-2 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                <b className="font-normal text-[18px]">No images added</b>
                <span className="text-[14px]">
                  Add an image to the room to start using the library.
                </span>
              </div>
            )}
            {appImages.length > 0 &&
              appImages.map((image) => {
                const imageId = image.key;

                let imageUrl = "";

                if (isRelativeUrl(image.props.imageURL)) {
                  const baseUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ":" + window.location.port : ""}`;
                  imageUrl = `${baseUrl}${image.props.imageURL}`;
                } else {
                  imageUrl = image.props.imageURL;
                }

                return (
                  <div
                    key={imageId}
                    className="group w-full h-[100px] bg-light-background-1 object-cover cursor-pointer border border-zinc-200 relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full object-cover"
                      draggable="true"
                      src={imageUrl}
                      alt="An image"
                    />
                    <button
                      className="absolute bottom-[8px] right-[8px] bg-white p-2 border border-zinc-200 rounded hidden group-hover:block cursor-pointer"
                      onClick={() => {
                        if (!instance) {
                          return;
                        }

                        const node = instance.getStage().findOne(`#${imageId}`);

                        if (node) {
                          const nodeHandler =
                            instance.getNodeHandler<WeaveImageNode>(
                              node.getAttrs().nodeType
                            );
                          if (!nodeHandler) {
                            return;
                          }

                          instance.removeNode(
                            nodeHandler.serialize(node as WeaveElementInstance)
                          );
                        }
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
