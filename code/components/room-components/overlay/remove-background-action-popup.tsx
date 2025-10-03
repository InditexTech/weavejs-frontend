// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { v4 as uuidv4 } from "uuid";
import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { Button } from "@/components/ui/button";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { WeaveNode } from "@inditextech/weave-sdk";

export function RemoveBackgroundActionPopup() {
  useKeyboardHandler();

  const instance = useWeave((state) => state.instance);

  const originNodeId = useCollaborationRoom(
    (state) => state.images.removeBackgroundPopup.originNodeId
  );
  const imageId = useCollaborationRoom(
    (state) => state.images.removeBackgroundPopup.imageId
  );
  const originalImage = useCollaborationRoom(
    (state) => state.images.removeBackgroundPopup.originImage
  );
  const imageURL = useCollaborationRoom(
    (state) => state.images.removeBackgroundPopup.imageURL
  );
  const showPopup = useCollaborationRoom(
    (state) => state.images.removeBackgroundPopup.show
  );
  const setRemoveBackgroundPopupAction = useCollaborationRoom(
    (state) => state.setRemoveBackgroundPopupAction
  );
  const setRemoveBackgroundPopupShow = useCollaborationRoom(
    (state) => state.setRemoveBackgroundPopupShow
  );

  return (
    <>
      <Dialog
        open={showPopup}
        onOpenChange={(open) => {
          setRemoveBackgroundPopupShow(open);
        }}
      >
        <DialogContent className="!max-w-[calc(640px_+_32px)]">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Remove Background Action
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setRemoveBackgroundPopupShow(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
            <div className="flex justify-center items-center gap-5 mt-5">
              <img
                src={originalImage}
                alt="Original image"
                className="object-contain max-w-[300px] h-[300px] border border-[#c9c9c9]"
              />
              <img
                src={imageURL}
                alt="Background removed"
                className="object-contain max-w-[300px] h-[300px] border border-[#c9c9c9] transparent-square-background"
              />
            </div>
            <DialogDescription
              asChild
              className="mt-2 py-2 flex gap-5 justify-between items-center"
            >
              <div className="font-inter text-sm ">
                We had successfully removed the background, you want to?
              </div>
            </DialogDescription>
            <div className="w-full h-[1px] bg-[#c9c9c9]"></div>
          </DialogHeader>
          <DialogFooter>
            <div className="w-full flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer font-inter rounded-none"
                onClick={async () => {
                  setRemoveBackgroundPopupAction("replace");
                  setRemoveBackgroundPopupShow(false);

                  if (!instance) return;

                  if (!originNodeId) return;

                  const originNode = instance
                    .getStage()
                    .findOne(`#${originNodeId}`);

                  if (!originNode) return;

                  const nodeHandler = instance.getNodeHandler<WeaveNode>(
                    originNode.getAttrs().nodeType
                  );

                  if (!nodeHandler) return;

                  const imageContainer =
                    instance.getNodeContainerId(originNode);

                  if (imageContainer === "") return;

                  const imageX = originNode.x();
                  const imageY = originNode.y();
                  const imageWidth = originNode.getAttrs().imageWidth;
                  const imageHeight = originNode.getAttrs().imageHeight;
                  const imageInfo = originNode.getAttrs().imageInfo;

                  instance.removeNode(
                    nodeHandler.serialize(originNode as WeaveElementInstance)
                  );

                  const imageNode = nodeHandler.create(uuidv4(), {
                    x: imageX,
                    y: imageY,
                    opacity: 1,
                    adding: false,
                    imageURL,
                    stroke: "#000000ff",
                    strokeWidth: 0,
                    strokeScaleEnabled: true,
                    imageWidth,
                    imageHeight,
                    imageInfo,
                  });

                  instance.addNode(imageNode, imageContainer);
                }}
              >
                REPLACE THE IMAGE
              </Button>
              <Button
                type="button"
                className="cursor-pointer font-inter rounded-none"
                onClick={async () => {
                  setRemoveBackgroundPopupAction("new");
                  setRemoveBackgroundPopupShow(false);

                  if (!instance) return;

                  const { finishUploadCallback } = instance.triggerAction(
                    "imageTool"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ) as any;

                  instance.updatePropsAction("imageTool", { imageId });

                  finishUploadCallback(imageURL);
                }}
              >
                ADD A NEW IMAGE
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
