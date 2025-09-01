// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
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
import { X } from "lucide-react";
import { ImageReference, useIACapabilitiesV2 } from "@/store/ia-v2";
import Masonry from "react-responsive-masonry";

const IMAGES_LIMIT = 20;

export const LLMReferenceSelectionPopupV2 = () => {
  const imagesRef = React.useRef<HTMLDivElement>(null);

  const instance = useWeave((state) => state.instance);

  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);

  const room = useCollaborationRoom((state) => state.room);

  const referenceImagesVisible = useIACapabilitiesV2(
    (state) => state.references.visible
  );

  const imagesReferences = useIACapabilitiesV2(
    (state) => state.references.images
  );
  const setImagesLLMReferencesVisible = useIACapabilitiesV2(
    (state) => state.setImagesLLMReferencesVisible
  );
  const setImagesLLMReferences = useIACapabilitiesV2(
    (state) => state.setImagesLLMReferences
  );

  const handleCheckboxChange = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (checked: boolean, image: any) => {
      let newSelectedImages = [...selectedImages];
      if (checked) {
        newSelectedImages.push(image.imageId);
      } else {
        newSelectedImages = newSelectedImages.filter(
          (actImage) => actImage !== image.imageId
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
      return await getImagesV2(room ?? "", pageParam as number, IMAGES_LIMIT);
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
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

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  React.useEffect(() => {
    if (imagesReferences) {
      setSelectedImages(imagesReferences.map((image) => image.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesReferences]);

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
        {isFetching && <div>Loading...</div>}
        {!isFetching && (
          <ScrollArea className="w-full h-auto max-h-[calc(100dvh-200px-80px-48px-40px)] overflow-auto">
            <div className="w-full" ref={imagesRef}>
              {images.length === 0 && (
                <div className="col-span-1 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                  <b className="font-normal text-[18px]">No images added</b>
                  <span className="text-[14px]">
                    Add an image to the room to start using the library.
                  </span>
                </div>
              )}
              <Masonry sequential columnsCount={3} gutter="1px">
                {images.length > 0 &&
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  images.map((image: any) => {
                    const roomId = image.roomId;
                    const imageId = image.imageId;

                    const imageUrl = `${process.env.NEXT_PUBLIC_API_V2_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/images/${imageId}`;

                    const isChecked = selectedImages.includes(image.imageId);

                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        key={imageId}
                        className="group block w-full aspect-auto bg-light-background-1 object-cover cursor-pointer relative mb-[1px] border border-zinc-200 cursor-pointer"
                        onClick={() => {
                          handleCheckboxChange(!isChecked, image);
                        }}
                      >
                        {["completed"].includes(image.status) && (
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
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}

                        {((image.removalJobId === null &&
                          ["created", "pending", "working", "failed"].includes(
                            image.status
                          )) ||
                          (image.removalJobId !== null &&
                            ["failed"].includes(image.status))) && (
                          <div
                            className="w-full h-full flex justify-center items-center"
                            style={{
                              width: "100%",
                              height: "100%",
                              aspectRatio: `${image.aspectRatio}`,
                            }}
                          ></div>
                        )}
                        {["completed"].includes(image.status) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="w-full h-full aspect-auto block object-cover"
                            draggable="true"
                            id={imageId}
                            src={imageUrl}
                            alt="An image"
                          />
                        )}
                      </div>
                    );
                  })}
              </Masonry>
              <div ref={ref} className="h-[0px]" />
              {query.isFetchingNextPage && (
                <p className="font-inter text-xs uppercase text-center py-4">
                  loading more...
                </p>
              )}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <div className="w-full flex justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setImagesLLMReferences([]);
                setImagesLLMReferencesVisible(false);
                setSelectedImages([]);
              }}
            >
              RESET
            </Button>
            <div>
              <Button
                type="button"
                disabled={
                  selectedImages.length === 0 || selectedImages.length > 4
                }
                className="cursor-pointer font-inter rounded-none"
                onClick={async () => {
                  if (!imagesRef.current) {
                    return;
                  }

                  const newReferences: ImageReference[] = [];

                  for (const image of selectedImages as string[]) {
                    const element = imagesRef.current.querySelector(
                      `img[id="${image}"]`
                    ) as HTMLImageElement | null;
                    if (!element) {
                      continue;
                    }

                    const imageElement = images.find(
                      (imageAct) => imageAct.imageId === image
                    );

                    if (typeof imageElement === "undefined") {
                      continue;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = element.naturalWidth;
                    canvas.height = element.naturalHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(element, 0, 0);

                      const dataURL = canvas.toDataURL("image/png");
                      newReferences.push({
                        id: imageElement.imageId,
                        aspectRatio: imageElement.aspectRatio,
                        base64Image: dataURL,
                      });
                    }
                  }

                  setImagesLLMReferences(newReferences);
                  setImagesLLMReferencesVisible(false);
                  setSelectedImages([]);
                }}
              >
                ADD AS REFERENCE
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
