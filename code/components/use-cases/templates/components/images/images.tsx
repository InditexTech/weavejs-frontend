// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { toast } from "sonner";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Masonry from "react-responsive-masonry";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useTemplatesUseCase } from "../../store/store";
import { ImagesIcon, ImageUpIcon, PlusIcon, TrashIcon } from "lucide-react";
import { ScaleLoader } from "react-spinners";
import { getTemplatesImages } from "@/api/templates/get-templates-images";
import { UploadImage } from "../upload-image";
import { useAddToRoom } from "../../store/add-to-room";
import { delTemplatesImage } from "@/api/templates/del-templates-image";

export const Images = () => {
  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const selectedImages = useTemplatesUseCase((state) => state.images.selected);
  const setShowSelectFileImage = useTemplatesUseCase(
    (state) => state.setShowSelectFileImage,
  );
  const setSelectedImages = useTemplatesUseCase(
    (state) => state.setSelectedImages,
  );
  const setAddToRoomOpen = useTemplatesUseCase(
    (state) => state.setAddToRoomOpen,
  );

  const setRoom = useAddToRoom((state) => state.setRoom);
  const setTemplate = useAddToRoom((state) => state.setTemplate);
  const setFrameName = useAddToRoom((state) => state.setFrameName);
  const setStep = useAddToRoom((state) => state.setStep);

  const queryClient = useQueryClient();

  const { data, isFetching, isFetched } = useInfiniteQuery({
    queryKey: ["getTemplatesImages", instanceId],
    queryFn: async ({ pageParam }) => {
      return await getTemplatesImages(
        instanceId,
        20,
        pageParam as unknown as string,
      );
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.continuationToken;
    },
  });

  const mutationDelete = useMutation({
    mutationFn: async (imageId: string) => {
      return await delTemplatesImage(instanceId ?? "", imageId);
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting images deletion...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      const queryKey = ["getTemplatesImages", instanceId];
      queryClient.invalidateQueries({ queryKey });

      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting images deletion.");
    },
  });

  const handleDeleteImage = React.useCallback(
    (image: string) => {
      mutationDelete.mutate(image);
    },
    [mutationDelete],
  );

  const images = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data.pages.flatMap((page) => page.images);
  }, [data]);

  return (
    <>
      <div className="w-full h-full grid grid-rows-1 grid-cols-1">
        <div className="relative w-full h-full flex flex-col justify-center items-start font-inter text-xl">
          {isFetching && (
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
                <ScaleLoader />
                <div className="font-inter text-xl">loading</div>
              </div>
            </div>
          )}
          {isFetched && !isFetching && images.length > 0 && (
            <>
              <ScrollArea className="w-full h-[calc(100dvh-65px-65px)]">
                <Masonry sequential columnsCount={4} gutter="1px">
                  {images.map((image) => (
                    <div key={image} className="relative w-full cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="w-full object-cover"
                        src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/templates/${instanceId}/images/${image}`}
                        alt={`image ${image} thumbnail`}
                        onClick={() => {
                          if (selectedImages.includes(image)) {
                            setSelectedImages(
                              selectedImages.filter((img) => img !== image),
                            );
                          } else {
                            setSelectedImages([...selectedImages, image]);
                          }
                        }}
                      />
                      <div className="absolute right-5 top-5">
                        <Checkbox
                          checked={selectedImages.includes(image)}
                          onClick={() => {
                            if (selectedImages.includes(image)) {
                              setSelectedImages(
                                selectedImages.filter((img) => img !== image),
                              );
                            } else {
                              setSelectedImages([...selectedImages, image]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </Masonry>
              </ScrollArea>
              <div className="w-full h-[65px] p-5 py-3 bg-white border-t border-[#c9c9c9] flex justify-between items-center">
                <div className="flex justify-start items-center gap-3">
                  <span className="text-base">ACTIONS</span>
                  <button
                    className="bg-black font-inter text-sm text-white p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-gray-800"
                    onClick={() => {
                      if (selectedImages.length > 0) {
                        setSelectedImages([]);
                      } else {
                        const allImages = data?.pages.flatMap(
                          (page) => page.images,
                        );
                        if (allImages) {
                          setSelectedImages(allImages);
                        }
                      }
                    }}
                  >
                    TOGGLE ALL
                  </button>
                  {selectedImages.length > 0 && (
                    <span className="text-xs">
                      SELECTED {`${selectedImages.length}`} IMAGES
                    </span>
                  )}
                </div>
                <div className="flex justify-end items-center gap-1">
                  {selectedImages.length > 0 && (
                    <>
                      <button
                        className="bg-[#cc0000] font-inter text-sm text-white p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-[#1D4ED8]"
                        onClick={() => {
                          for (const image of selectedImages) {
                            handleDeleteImage(image);
                          }

                          setSelectedImages([]);
                        }}
                      >
                        DELETE SELECTED IMAGES{" "}
                        <TrashIcon size={20} strokeWidth={1} />
                      </button>
                      <button
                        className="bg-[#2563EB] font-inter text-sm text-white p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-[#1D4ED8]"
                        onClick={() => {
                          setRoom(undefined);
                          setTemplate(undefined);
                          setFrameName("");
                          setStep("select-room");
                          setAddToRoomOpen(true);
                        }}
                      >
                        ADD SELECTED IMAGES TO ROOM{" "}
                        <PlusIcon size={20} strokeWidth={1} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {isFetched && !isFetching && images.length === 0 && (
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-full p-5 flex flex-col gap-2 justify-center items-center">
                <ImagesIcon strokeWidth={1} size={32} />
                <div className="font-inter text-base mb-3">
                  No images loaded
                </div>
                <button
                  className="bg-black text-white font-inter text-sm p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-gray-800"
                  onClick={() => {
                    setShowSelectFileImage(true);
                  }}
                >
                  UPLOAD IMAGE <ImageUpIcon size={20} strokeWidth={1} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <UploadImage />
    </>
  );
};
