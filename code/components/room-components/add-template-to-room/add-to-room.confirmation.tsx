// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import {
  postAddImageTemplateToRoom,
  PostAddImageTemplateToRoomPayload,
} from "@/api/post-add-image-template-to-room";
import { useAddTemplateToRoom } from "@/store/add-template-to-room";
import { AddToRoomRenderTemplate } from "./add-to-room.render-template";
import { useCollaborationRoom } from "@/store/store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useWeave } from "@inditextech/weave-react";
import Konva from "konva";

export function AddToRoomConfirmation() {
  const [targetContainer, setTargetContainer] =
    React.useState<string>("mainLayer");
  const [positionKind, setPositionKind] = React.useState<
    "at-origin" | "centered-at-origin" | "custom"
  >("at-origin");
  const [position, setPosition] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const instance = useWeave((state) => state.instance);

  const actualRoom = useCollaborationRoom((state) => state.roomInfo.data);
  const actualPage = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );

  const room = useAddTemplateToRoom((state) => state.room);
  const page = useAddTemplateToRoom((state) => state.page);
  const template = useAddTemplateToRoom((state) => state.template);
  const renderSize = useAddTemplateToRoom((state) => state.render.size);
  const templateParameters = useAddTemplateToRoom((state) => state.parameters);
  const setStep = useAddTemplateToRoom((state) => state.setStep);
  const setVisible = useAddTemplateToRoom((state) => state.setVisible);
  const setTemplate = useAddTemplateToRoom((state) => state.setTemplate);
  const setTemplateParameters = useAddTemplateToRoom(
    (state) => state.setTemplateParameters,
  );
  const setImages = useAddTemplateToRoom((state) => state.setImages);
  const [processing, setProcessing] = React.useState(false);

  console.log("template", template);
  console.log("templateParameters", templateParameters);

  const mutationAddToRoom = useMutation({
    mutationFn: async (payload: PostAddImageTemplateToRoomPayload) => {
      return await postAddImageTemplateToRoom(payload);
    },
    onSettled() {
      setProcessing(false);
    },
    onSuccess() {
      if (!room) {
        return;
      }

      setTemplate(undefined);
      setTemplateParameters({});
      setImages([]);
      setVisible(false);
    },
    onError() {
      toast.error("Failed to create template, please try again");
    },
  });

  const targetContainers = React.useMemo(() => {
    if (!instance) {
      return [];
    }

    const stage = instance.getStage();
    const containers = stage.find(
      (n: Konva.Node) =>
        n.getAttrs().name?.indexOf("node") !== -1 &&
        n.getAttrs().nodeType === "frame",
    );

    return containers.map((c) => ({
      id: c.id(),
      name: c.getAttrs().nodeName ?? c.getAttrs().id,
    }));
  }, [instance]);

  if (!template || !room) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols gir-rows-[auto_1fr_auto_auto] gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Check the selection and confirm to add the template. The template will
          be added on the center of the page.
        </DialogDescription>
        <div className="relative border-[0.5px] border-[#c9c9c9] bg-[#c9c9c9] flex flex-col justify-center items-center">
          <div className="aspect-square bg-[#c9c9c9] flex flex-col justify-center items-center">
            <AddToRoomRenderTemplate readOnly width={600} height={600} />
          </div>
        </div>
        <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-3"></div>
        <div className="h-[calc(100dvh-48px-32px-72px-20px-600px-25px-25px-48px-192px)] flex flex-col gap-3">
          <div className="text-lg mb-5">Destination</div>
          <div className="w-full flex justify-between items-center font-light text-xs min-h-[30px]">
            <div>Room</div>
            <div>{actualRoom.room.name}</div>
          </div>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
          <div className="w-full flex justify-between items-center font-light text-xs min-h-[30px]">
            <div>Page</div>
            <div>{actualPage.name}</div>
          </div>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
          <div className="w-full flex justify-between items-center font-light text-xs">
            <div>Target container</div>
            <Select
              value={targetContainer}
              onValueChange={(value) => {
                setTargetContainer(value);
              }}
            >
              <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                <SelectValue placeholder="Target container" />
              </SelectTrigger>
              <SelectContent
                className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                align="end"
              >
                <SelectGroup>
                  <SelectItem
                    value="mainLayer"
                    className="font-inter text-xs rounded-none"
                  >
                    main layer
                  </SelectItem>
                  {targetContainers.map((container) => (
                    <SelectItem
                      key={container.id}
                      value={container.id}
                      className="font-inter text-xs rounded-none"
                    >
                      {container.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
          <div className="w-full flex justify-between items-center font-light text-xs">
            <div>Position</div>
            <Select
              value={positionKind}
              onValueChange={(value) => {
                if (!instance) {
                  return;
                }

                const stage = instance.getStage();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setPositionKind(value as any);

                if (targetContainer === "mainLayer") {
                  switch (value) {
                    case "at-origin":
                      setPosition({ x: 0, y: 0 });
                      break;
                    case "centered-at-origin":
                      if (renderSize) {
                        setPosition({
                          x: -(renderSize.width ?? 0) / 2,
                          y: -(renderSize.height ?? 0) / 2,
                        });
                      }
                      break;
                    case "custom":
                      // keep the current position
                      break;
                    default:
                      setPosition({ x: 0, y: 0 });
                  }
                } else {
                  const container = stage.findOne(`#${targetContainer}`);

                  if (!container) {
                    return;
                  }

                  switch (value) {
                    case "at-origin":
                      setPosition({ x: 0, y: 0 });
                      break;
                    case "centered-at-origin":
                      if (renderSize) {
                        const diffX =
                          (container.width() - renderSize.width) / 2;
                        const diffY =
                          (container.height() - renderSize.height) / 2;
                        setPosition({
                          x: diffX,
                          y: diffY,
                        });
                      }
                      break;
                    case "custom":
                      // keep the current position
                      break;
                    default:
                      setPosition({ x: 0, y: 0 });
                  }
                }
              }}
            >
              <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent
                className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                align="end"
              >
                <SelectGroup>
                  <SelectItem
                    value="at-origin"
                    className="font-inter text-xs rounded-none"
                  >
                    At target's origin
                  </SelectItem>
                  <SelectItem
                    value="centered-at-origin"
                    className="font-inter text-xs rounded-none"
                  >
                    Centered at target's
                  </SelectItem>
                  <SelectItem
                    value="custom"
                    className="font-inter text-xs rounded-none"
                  >
                    Custom position
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {positionKind === "custom" && (
            <>
              <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
              <div className="w-full grid grid-cols-[1fr_auto] gap-y-3 justify-between items-center font-light text-xs">
                <div className="w-full">X</div>
                <div className="w-full">
                  <Input
                    type="number"
                    pattern="-?\d+"
                    className="w-full font-inter !py-1 !pt-[2px] text-right text-xs rounded-none !h-[30px] !border-black !shadow-none"
                    value={position.x}
                    onFocus={() => {
                      window.weaveOnFieldFocus = true;
                    }}
                    onBlurCapture={() => {
                      window.weaveOnFieldFocus = false;
                    }}
                    onChange={(e) => {
                      const newPosition = {
                        ...position,
                        x: Number(e.target.value),
                      };

                      setPosition(newPosition);
                    }}
                  />
                </div>
                <div className="w-full">Y</div>
                <div className="w-full">
                  <Input
                    type="number"
                    pattern="-?\d+"
                    className="w-full font-inter !py-1 !pt-[2px] text-right text-xs rounded-none !h-[30px] !border-black !shadow-none"
                    value={position.y}
                    onFocus={() => {
                      window.weaveOnFieldFocus = true;
                    }}
                    onBlurCapture={() => {
                      window.weaveOnFieldFocus = false;
                    }}
                    onChange={(e) => {
                      const newPosition = {
                        ...position,
                        y: Number(e.target.value),
                      };

                      setPosition(newPosition);
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-3"></div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={processing}
            className="cursor-pointer font-inter rounded-none"
            onClick={() => {
              setStep("configuration");
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
                roomId: room.id,
                pageId: page?.id ?? "",
                templateId: template.templateId,
                target: {
                  id: targetContainer,
                  position,
                },
                parameters: templateParameters,
              });
            }}
          >
            {processing ? (
              <>
                <Spinner data-icon="inline-start" /> PROCESSING...
              </>
            ) : (
              "CREATE"
            )}
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
