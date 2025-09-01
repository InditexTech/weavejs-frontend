// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { getImages } from "@/api/get-images";
import { getImages as getImagesV2 } from "@/api/v2/get-images";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIACapabilities } from "@/store/ia";
import { X } from "lucide-react";

const IMAGES_LIMIT = 20;

export const LLMReferenceSelectionPopup = () => {
  const imagesRef = React.useRef<HTMLDivElement>(null);

  const instance = useWeave((state) => state.instance);

  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);

  const room = useCollaborationRoom((state) => state.room);
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
  );

  const referenceImagesIds = useIACapabilities(
    (state) => state.references.imagesIds
  );
  const referenceImagesVisible = useIACapabilities(
    (state) => state.references.visible
  );
  const setImagesLLMReferencesVisible = useIACapabilities(
    (state) => state.setImagesLLMReferencesVisible
  );
  const setImagesLLMReferencesIds = useIACapabilities(
    (state) => state.setImagesLLMReferencesIds
  );
  const setImagesLLMReferences = useIACapabilities(
    (state) => state.setImagesLLMReferences
  );

  React.useEffect(() => {
    setSelectedImages(referenceImagesIds);
  }, [referenceImagesIds]);

  const handleCheckboxChange = React.useCallback(
    (checked: boolean, image: string) => {
      let newSelectedImages = [...selectedImages];
      if (checked) {
        newSelectedImages.push(image);
      } else {
        newSelectedImages = newSelectedImages.filter(
          (actImage) => actImage !== image
        );
      }
      const unique = [...new Set(newSelectedImages)];
      setSelectedImages(unique);
    },
    [selectedImages]
  );

  const query = useInfiniteQuery({
    queryKey: ["getImages", room],
    queryFn: async ({ pageParam }) => {
      if (!workloadsEnabled) {
        return [];
      }
      if (!room) {
        return [];
      }
      if (workloadsEnabled) {
        return await getImagesV2(
          room ?? "",
          (pageParam as number) * IMAGES_LIMIT,
          IMAGES_LIMIT
        );
      }
      return await getImages(room ?? "", 20, pageParam as string);
    },
    initialPageParam: workloadsEnabled ? 0 : "",
    getNextPageParam: (lastPage, allPages) => {
      if (!workloadsEnabled) {
        return lastPage.continuationToken;
      }
      const loadedSoFar = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0
      );
      if (loadedSoFar < lastPage.total) {
        return loadedSoFar; // next offset
      }
      return undefined; // no more pages
    },
    enabled: referenceImagesVisible,
  });

  const linearData = React.useMemo(() => {
    return query.data?.pages.flatMap((page) => page.images) ?? [];
  }, [query.data]);

  const isFetching = React.useMemo(() => {
    return query.isFetching;
  }, [query.isFetching]);

  const images = React.useMemo(() => {
    return query.data?.pages.flatMap((page) => page.items) ?? [];
  }, [query.data]);

  if (!instance) {
    return null;
  }

  return (
    <Dialog
      open={referenceImagesVisible}
      onOpenChange={(value) => {
        setImagesLLMReferencesVisible(value);
      }}
    >
      <DialogContent className="!max-w-[calc(660px_+_48px)]">
        <DialogHeader>
          <div className="w-full flex gap-5 justify-between items-center">
            <DialogTitle className="font-inter text-2xl font-normal uppercase">
              Reference Images
            </DialogTitle>

            <DialogClose asChild>
              <button
                className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                onClick={() => {
                  setSelectedImages([]);
                  setImagesLLMReferencesIds([]);
                  setImagesLLMReferences([]);
                  setImagesLLMReferencesVisible(false);
                }}
              >
                <X size={16} strokeWidth={1} />
              </button>
            </DialogClose>
          </div>
          <DialogDescription className="font-inter text-sm mt-5">
            Select the images you want to use as reference. You can select a
            maximum of 4 images.
          </DialogDescription>
        </DialogHeader>
        {!workloadsEnabled && (
          <ScrollArea className="w-full h-auto max-h-[calc(100dvh-200px-80px-48px-40px)] overflow-auto">
            <div className="flex flex-col gap-2 w-full">
              <div
                className="grid grid-cols-3 gap-2 w-full weaveDraggable"
                ref={imagesRef}
                onDragStart={(e) => {
                  if (e.target instanceof HTMLImageElement) {
                    window.weaveDragImageURL = e.target.src;
                  }
                }}
              >
                {linearData.length === 0 && (
                  <div className="col-span-2 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light uppercase">
                    <b className="font-normal text-[18px]">No images found</b>
                  </div>
                )}
                {linearData.length > 0 &&
                  linearData.map((image) => {
                    const imageUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/images/${image}`;

                    const isChecked = selectedImages.includes(image);

                    return (
                      <div
                        key={image}
                        className="group w-full h-full h-[300px] bg-light-background-1 object-cover cursor-pointer border border-zinc-200 relative"
                      >
                        <div className="absolute top-[16px] right-[16px] z-10">
                          <Checkbox
                            id="terms"
                            className="bg-white"
                            value={image}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              handleCheckboxChange(checked as boolean, image);
                            }}
                          />
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover"
                          draggable="true"
                          id={image}
                          onKeyUp={(e) => {
                            if (e.key === "Space") {
                              let newSelectedImages = [...selectedImages];
                              if (newSelectedImages.includes(image)) {
                                newSelectedImages = newSelectedImages.filter(
                                  (actImage) => actImage !== image
                                );
                              } else {
                                newSelectedImages.push(image);
                              }
                              const unique = [...new Set(newSelectedImages)];
                              setSelectedImages(unique);
                            }
                          }}
                          onClick={() => {
                            let newSelectedImages = [...selectedImages];
                            if (newSelectedImages.includes(image)) {
                              newSelectedImages = newSelectedImages.filter(
                                (actImage) => actImage !== image
                              );
                            } else {
                              newSelectedImages.push(image);
                            }
                            const unique = [...new Set(newSelectedImages)];
                            setSelectedImages(unique);
                          }}
                          src={imageUrl}
                          alt={`Reference ${image}`}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </ScrollArea>
        )}

        {workloadsEnabled && isFetching && <div>Loading...</div>}
        {workloadsEnabled && !isFetching && (
          <ScrollArea className="w-full h-auto max-h-[calc(100dvh-200px-80px-48px-40px)] overflow-auto">
            <div
              className="w-full weaveDraggable p-[24px]"
              onDragStart={(e) => {
                if (e.target instanceof HTMLImageElement) {
                  window.weaveDragImageURL = e.target.src;
                }
              }}
            >
              {images.length === 0 && (
                <div className="col-span-1 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                  <b className="font-normal text-[18px]">No images added</b>
                  <span className="text-[14px]">
                    Add an image to the room to start using the library.
                  </span>
                </div>
              )}
              {images.length > 0 && (
                <div className="w-full h-auto">
                  <div className="columns-2 gap-[24px]">
                    {images.map((image) => {
                      const roomId = image.roomId;
                      const imageId = image.imageId;

                      const imageUrl = `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/images/${imageId}`;

                      return (
                        <div
                          key={imageId}
                          className="group block w-full aspect-auto bg-light-background-1 object-cover cursor-pointer relative mb-[24px] border border-zinc-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="w-full h-full aspect-auto block object-cover"
                            draggable="true"
                            src={imageUrl}
                            alt="An image that can be selected as reference"
                          />
                          {/* {typeof appImage !== "undefined" && (
                            <div className="absolute bottom-[8px] left-[8px] bg-white p-2 border border-zinc-200 rounded hidden group-hover:block cursor-pointer font-inter text-xs">
                              in use
                            </div>
                          )} */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <div className="w-full flex justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled={selectedImages.length > 0}
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setImagesLLMReferencesIds([]);
                setImagesLLMReferences([]);
                setImagesLLMReferencesVisible(false);
                setSelectedImages([]);
              }}
            >
              REMOVE REFERENCES
            </Button>
            <div>
              <Button
                type="button"
                disabled={selectedImages.length === 0}
                className="cursor-pointer font-inter rounded-none"
                onClick={async () => {
                  if (!imagesRef.current) {
                    return;
                  }

                  const references = [];

                  for (const image of selectedImages) {
                    const element = imagesRef.current.querySelector(
                      `img[id="${image}"]`
                    ) as HTMLImageElement | null;
                    if (!element) {
                      continue;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = element.naturalWidth;
                    canvas.height = element.naturalHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(element, 0, 0);

                      const dataURL = canvas.toDataURL("image/png");
                      references.push({
                        base64Image: dataURL,
                      });
                    }
                  }

                  setImagesLLMReferencesIds(selectedImages);
                  setImagesLLMReferences(references);
                  setImagesLLMReferencesVisible(false);
                  setSelectedImages([]);
                }}
              >
                ADD REFERENCES
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
