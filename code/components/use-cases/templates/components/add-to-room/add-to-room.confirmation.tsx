// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import React from "react";
import Masonry from "react-responsive-masonry";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useTemplatesUseCase } from "../../store/store";
import { useAddToRoom } from "../../store/add-to-room";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
  postAddTemplateToRoom,
  PostAddTemplateToRoomPayload,
} from "@/api/post-add-template-to-room";

export function AddToRoomConfirmation() {
  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const selectedImages = useTemplatesUseCase((state) => state.images.selected);
  const setAddToRoomOpen = useTemplatesUseCase(
    (state) => state.setAddToRoomOpen,
  );
  const setSelectedImages = useTemplatesUseCase(
    (state) => state.setSelectedImages,
  );

  const room = useAddToRoom((state) => state.room);
  const template = useAddToRoom((state) => state.template);
  const frameName = useAddToRoom((state) => state.frameName);
  const setStep = useAddToRoom((state) => state.setStep);

  const [processing, setProcessing] = React.useState(false);

  const mutationAddToRoom = useMutation({
    mutationFn: async (payload: PostAddTemplateToRoomPayload) => {
      return await postAddTemplateToRoom(payload);
    },
    onSettled() {
      setProcessing(false);
    },
    onSuccess() {
      if (!room) {
        return;
      }

      if (room.create) {
        toast.success(
          `Room ${room.id} created and template added successfully`,
          {
            action: {
              label: "Go to room",
              onClick: () => {
                const host =
                  window.location.protocol + "//" + window.location.host;
                window.open(
                  `${host}/rooms/${room.id}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              },
            },
          },
        );
      } else {
        toast.success(`Template added to room ${room.id} successfully`);
      }

      setSelectedImages([]);
      setAddToRoomOpen(false);
    },
    onError() {
      toast.error("Failed to create template, please try again");
    },
  });

  if (!template || !room) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols gir-rows-[auto_1fr_auto_auto] gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Check the selection and confirm to add the images to the room.
        </DialogDescription>
        <div className="w-full h-[calc(100dvh-48px-32px-72px-20px-25px-48px-120px-196px-500px)] grid grid-cols-1 grid-rows-1">
          <div className="col-span-2 font-inter text-base text-right border border-[#c9c9c9]">
            <div className="w-full h-[calc(100dvh-48px-32px-72px-20px-25px-48px-120px-196px-500px)]">
              <ScrollArea className="w-full h-full">
                <Masonry sequential columnsCount={2} gutter="1px">
                  {selectedImages.map((image) => {
                    return (
                      <img
                        key={image}
                        className="object-cover w-full h-full"
                        src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/templates/${instanceId}/images/${image}`}
                        alt={`image ${image} thumbnail`}
                      />
                    );
                  })}
                </Masonry>
              </ScrollArea>
            </div>
          </div>
        </div>
        <div className="w-full h-full grid grid-cols-[1fr_auto] grid-rows-1 bg-[#f3f4f6] p-5">
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex flex-col gap-0">
              <div className="font-inter text-sm text-muted-foreground uppercase">
                Action
              </div>
              <div className="font-inter text-base text-left uppercase">
                {room?.create ? "Create" : "Add"}
              </div>
            </div>
            <div className="w-full flex flex-col gap-0">
              <div className="font-inter text-sm text-muted-foreground uppercase">
                Room
              </div>
              <div className="font-inter text-base text-left">
                {room?.id || ""}
              </div>
            </div>
            <div className="w-full flex flex-col gap-0">
              <div className="font-inter text-sm text-muted-foreground uppercase">
                Frame name
              </div>
              <div className="font-inter text-base text-left">
                {frameName || ""}
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <div className="w-full h-full flex justify-start items-center font-inter text-sm text-muted-foreground uppercase">
              Template to use
            </div>
            <div className="font-inter text-base text-right">
              <div
                key={template.templateId}
                className={cn(
                  "block relative flex gap-0 w-[120px] h-[120px] object-cover bg-white relative overflow-hidden",
                )}
              >
                <img
                  className="bg-[#d6d6d6] w-full aspect-video block object-contain relative"
                  src={template.templateImage}
                  alt="A template"
                  data-template-data={template.templateData}
                />
                <div>{template.name}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
        <DialogFooter>
          <Button
            type="button"
            disabled={processing}
            className="cursor-pointer font-inter rounded-none"
            onClick={() => {
              setStep("select-template");
            }}
          >
            BACK
          </Button>
          <Button
            type="button"
            disabled={processing}
            className="cursor-pointer font-inter rounded-none"
            onClick={() => {
              setProcessing(true);
              mutationAddToRoom.mutate({
                ...(room.create && { roomName: room.id }),
                ...(!room.create && { roomId: room.id }),
                frameName,
                templateInstanceId: instanceId,
                templateId: template.templateId,
                imagesIds: selectedImages,
              });
            }}
          >
            {processing ? (
              <>
                <Spinner data-icon="inline-start" /> PROCESSING...
              </>
            ) : (
              "CONFIRM"
            )}
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
