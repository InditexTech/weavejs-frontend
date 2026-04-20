// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

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
import {
  ImagesIcon,
  ImageUpIcon,
  LayoutPanelTop,
  ListChecks,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { getTemplatesImages } from "@/api/templates/get-templates-images";
import { UploadImage } from "../upload-image";
import { useAddToRoom } from "../../store/add-to-room";
import { delTemplatesImage } from "@/api/templates/del-templates-image";
import { Badge } from "@/components/ui/badge";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { Divider } from "@/components/room-components/overlay/divider";

export const Images = () => {
  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const selectedImages = useTemplatesUseCase((state) => state.images.selected);
  const templatesManage = useTemplatesUseCase(
    (state) => state.templates.manage,
  );
  const setShowSelectFileImage = useTemplatesUseCase(
    (state) => state.setShowSelectFileImage,
  );
  const setSelectedImages = useTemplatesUseCase(
    (state) => state.setSelectedImages,
  );
  const setAddToRoomOpen = useTemplatesUseCase(
    (state) => state.setAddToRoomOpen,
  );
  const setTemplatesManage = useTemplatesUseCase(
    (state) => state.setTemplatesManage,
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

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

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
                <div className="font-light text-xl uppercase">loading</div>
              </div>
            </div>
          )}
          {isFetched && !isFetching && images.length > 0 && (
            <>
              <ScrollArea className="w-full h-[calc(100dvh-55px-40px)]">
                <Masonry columnsCount={6} gutter="1px">
                  {images.map((image) => (
                    <div key={image} className="relative w-full cursor-pointer">
                      <img
                        className="w-full object-cover"
                        src={`${apiEndpoint}/weavejs/templates/${instanceId}/images/${image}`}
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
              <div className="w-full h-[40px] px-[24px] bg-white border-t-[0.5px] border-[#c9c9c9] flex justify-between items-center">
                <div className="flex justify-start items-center gap-3">
                  <Badge variant="default" className="cursor-default uppercase">
                    actions
                  </Badge>
                  <Divider className="h-[20px]" />
                  <ToolbarButton
                    icon={<LayoutPanelTop strokeWidth={1} />}
                    onClick={() => {
                      setTemplatesManage(!templatesManage);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Manage templates</p>
                      </div>
                    }
                    size="small"
                    variant="squared"
                    tooltipSideOffset={14}
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    icon={<ImageUpIcon strokeWidth={1} />}
                    onClick={() => {
                      setShowSelectFileImage(true);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Upload image</p>
                      </div>
                    }
                    size="small"
                    variant="squared"
                    tooltipSideOffset={14}
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                  <Divider className="h-[20px]" />
                  <ToolbarButton
                    icon={<ListChecks size={20} strokeWidth={1} />}
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
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Toggle all</p>
                      </div>
                    }
                    size="small"
                    variant="squared"
                    tooltipSideOffset={14}
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                </div>
                <div className="flex justify-end items-center gap-3">
                  {selectedImages.length > 0 && (
                    <>
                      <Badge variant="outline" className="cursor-default ">
                        {`${selectedImages.length}`} IMAGE(S) SELECTED
                      </Badge>
                      <Divider className="h-[20px]" />
                    </>
                  )}
                  {selectedImages.length > 0 && (
                    <>
                      <ToolbarButton
                        icon={<TrashIcon size={20} strokeWidth={1} />}
                        onClick={() => {
                          for (const image of selectedImages) {
                            handleDeleteImage(image);
                          }

                          setSelectedImages([]);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>Delete selected</p>
                          </div>
                        }
                        size="small"
                        variant="squared"
                        tooltipSideOffset={14}
                        tooltipSide="top"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        icon={<PlusIcon size={20} strokeWidth={1} />}
                        onClick={() => {
                          setRoom(undefined);
                          setTemplate(undefined);
                          setFrameName("");
                          setStep("select-room");
                          setAddToRoomOpen(true);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>Add to room</p>
                          </div>
                        }
                        size="small"
                        variant="squared"
                        tooltipSideOffset={14}
                        tooltipSide="top"
                        tooltipAlign="end"
                      />
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {isFetched && !isFetching && images.length === 0 && (
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-full p-5 flex flex-col gap-8 justify-center items-center">
                <div className="flex flex-col justify-center items-center gap-2">
                  <ImagesIcon strokeWidth={1} size={48} />
                  <div className="font-light text-base mb-3 uppercase">
                    No images loaded
                  </div>
                </div>
                <button
                  className="bg-black text-white font-inter text-sm p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-gray-800"
                  onClick={() => {
                    setShowSelectFileImage(true);
                  }}
                >
                  UPLOAD IMAGE
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
