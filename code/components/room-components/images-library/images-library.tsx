// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import Masonry from "react-responsive-masonry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BrushCleaning,
  Info,
  Link,
  RefreshCw,
  SquareCheck,
  SquareX,
  Trash,
  Trash2,
  Unlink,
  X,
} from "lucide-react";
import {
  WeaveStateElement,
  WeaveElementAttributes,
  WeaveElementInstance,
} from "@inditextech/weave-types";
import { delImage } from "@/api/v2/del-image";
import { useWeave } from "@inditextech/weave-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { WeaveImageNode } from "@inditextech/weave-sdk";
import { getImages } from "@/api/get-images";
import { getImages as getImagesV2 } from "@/api/v2/get-images";
import { postRemoveBackground as postRemoveBackgroundV2 } from "@/api/v2/post-remove-background";
import { RemovedBackgroundImage } from "./removed-background.image";
import { UploadedImage } from "./uploaded.image";
import { useIACapabilities } from "@/store/ia";
import { useIACapabilitiesV2 } from "@/store/ia-v2";
import { GeneratedImage } from "./generated-image.image";
import { EditImage } from "./edit-image.image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { ImageEntity } from "./types";

function isRelativeUrl(url: string) {
  try {
    new URL(url);
    return false;
  } catch {
    return true;
  }
}

const IMAGES_LIMIT = 8;

export const ImagesLibrary = () => {
  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);

  const [selectedImages, setSelectedImages] = React.useState<ImageEntity[]>([]);
  const [images, setImages] = React.useState<ImageEntity[]>([]);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
  );

  const queryClient = useQueryClient();

  const aiEnabled = useIACapabilities((state) => state.enabled);
  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );
  const aiEnabledV2 = useIACapabilitiesV2((state) => state.enabled);
  const imagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.visible
  );
  const imagesReferences = useIACapabilitiesV2(
    (state) => state.references.images
  );
  const setImagesReferences = useIACapabilitiesV2(
    (state) => state.setImagesLLMReferences
  );

  const mutationUploadV2 = useMutation({
    mutationFn: async ({
      userId,
      clientId,
      imageId,
      image,
    }: {
      userId: string;
      clientId: string;
      imageId: string;
      image: {
        dataBase64: string;
        contentType: string;
      };
    }) => {
      return await postRemoveBackgroundV2(
        userId,
        clientId,
        room ?? "",
        imageId,
        image
      );
    },
  });

  const mutationDelete = useMutation({
    mutationFn: async (imageId: string) => {
      return await delImage(
        user?.name ?? "",
        clientId ?? "",
        room ?? "",
        imageId
      );
    },
  });

  const handleDeleteImage = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (image: any) => {
      if (!instance) {
        return;
      }

      mutationDelete.mutate(image.imageId, {
        onError: () => {
          toast.error("Error requesting image removal.");
        },
      });
    },
    [instance, mutationDelete]
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
  );

  const handleSetImageReference = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (image: any) => {
      const element = document.querySelector(
        `img[id="${image.imageId}"]`
      ) as HTMLImageElement | null;

      if (!element) {
        return;
      }

      const newReferences = [...imagesReferences];
      const existsReference = newReferences.find(
        (ele) => ele.id === image.imageId
      );

      if (typeof existsReference !== "undefined") {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = element.naturalWidth;
      canvas.height = element.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(element, 0, 0);

        const dataURL = canvas.toDataURL("image/png");
        newReferences.push({
          id: image.imageId,
          aspectRatio: image.aspectRatio,
          base64Image: dataURL,
        });
      }

      setImagesReferences(newReferences);
    },
    [imagesReferences, setImagesReferences]
  );

  const handleSetImagesReference = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (images: any[]) => {
      const newReferences = [...imagesReferences];

      for (const image of images) {
        const element = document.querySelector(
          `img[id="${image.imageId}"]`
        ) as HTMLImageElement | null;

        if (!element) {
          return;
        }

        const existsReference = newReferences.find(
          (ele) => ele.id === image.imageId
        );

        if (typeof existsReference !== "undefined") {
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
            id: image.imageId,
            aspectRatio: image.aspectRatio,
            base64Image: dataURL,
          });
        }
      }

      setImagesReferences(newReferences);
    },
    [imagesReferences, setImagesReferences]
  );

  const handleRemoveImageReference = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (image: any) => {
      const element = document.querySelector(
        `img[id="${image.imageId}"]`
      ) as HTMLImageElement | null;

      if (!element) {
        return;
      }

      let newReferences = [...imagesReferences];

      newReferences = newReferences.filter((ele) => ele.id !== image.imageId);

      setImagesReferences(newReferences);
    },
    [imagesReferences, setImagesReferences]
  );

  const handleRemoveImagesReference = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (images: any[]) => {
      let newReferences = [...imagesReferences];

      for (const image of images) {
        const element = document.querySelector(
          `img[id="${image.imageId}"]`
        ) as HTMLImageElement | null;

        if (!element) {
          continue;
        }

        newReferences = newReferences.filter((ele) => ele.id !== image.imageId);
      }

      setImagesReferences(newReferences);
    },
    [imagesReferences, setImagesReferences]
  );

  const handleRemoveBackground = React.useCallback(
    (image: ImageEntity) => {
      if (!instance) {
        return;
      }

      const element = document.querySelector(
        `img[id="${image.imageId}"]`
      ) as HTMLImageElement | null;

      if (!element) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = element.naturalWidth;
      canvas.height = element.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(element, 0, 0);

        const dataBase64Url = canvas.toDataURL("image/png");

        const dataBase64 = dataBase64Url.split(",")[1];

        mutationUploadV2.mutate(
          {
            userId: user?.name ?? "",
            clientId: clientId ?? "",
            imageId: uuidv4(),
            image: {
              dataBase64,
              contentType: "image/png",
            },
          },
          {
            onSuccess: () => {
              sidebarToggle(SIDEBAR_ELEMENTS.images);
            },
            onError: () => {
              toast.error("Error requesting image background removal.");
            },
          }
        );
      }
    },
    [instance, clientId, user, sidebarToggle, mutationUploadV2]
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
        return await getImagesV2(room ?? "", pageParam as number, IMAGES_LIMIT);
      }
      return await getImages(room ?? "", 20, pageParam as string);
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
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
    enabled: sidebarLeftActive === "images",
  });

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

  React.useEffect(() => {
    if (!query.data) return;
    setImages((prev: ImageEntity[]) =>
      (query.data?.pages.flatMap((page) => page.items) ?? []).map(
        (newItem: ImageEntity) =>
          prev.find(
            (oldItem) =>
              oldItem.imageId === newItem.imageId &&
              oldItem.updatedAt === newItem.updatedAt
          ) || newItem
      )
    );
  }, [query.data]);

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  const realSelectedImages = React.useMemo(() => {
    return selectedImages.filter((image) => images.includes(image));
  }, [selectedImages, images]);

  const inUseSelectedImages = React.useMemo(() => {
    const inUse = [];

    for (const image of realSelectedImages) {
      const appImage = appImages.find(
        (appImage) => appImage.props.imageId === image.imageId
      );
      if (typeof appImage !== "undefined") {
        inUse.push(image);
      }
    }

    return inUse;
  }, [realSelectedImages, appImages]);

  const [unreferencedSelectedImages, referencedSelectedImages] =
    React.useMemo(() => {
      const unreferenced = [];
      const referenced = [];

      for (const image of realSelectedImages) {
        const referenceImage = imagesReferences.find(
          (appImage) => appImage.id === image.imageId
        );
        if (typeof referenceImage !== "undefined") {
          referenced.push(image);
        } else {
          unreferenced.push(image);
        }
      }

      return [unreferenced, referenced];
    }, [realSelectedImages, imagesReferences]);

  const handleCheckNone = React.useCallback(() => {
    setSelectedImages([]);
  }, []);

  const handleCheckAll = React.useCallback(() => {
    const newSelectedImages = [];

    for (const image of images) {
      newSelectedImages.push(image);
    }

    setSelectedImages(newSelectedImages);
  }, [images]);

  const handleCheckboxChange = React.useCallback(
    (checked: boolean, image: ImageEntity) => {
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

  if (!instance) {
    return null;
  }

  if (sidebarLeftActive !== SIDEBAR_ELEMENTS.images) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full px-[24px] py-[27px] bg-white flex justify-between items-center border-b border-b-[0.5px] border-[#c9c9c9]">
        <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
          <SidebarSelector title="Images" />
        </div>
        <div className="flex justify-end items-center gap-4">
          <button
            className="cursor-pointer flex justify-center items-center w-[20px] h-[40px] text-center bg-transparent hover:text-[#c9c9c9]"
            onClick={() => {
              handleCheckNone();
            }}
          >
            <SquareX size={20} strokeWidth={1} />
          </button>
          <button
            className="cursor-pointer flex justify-center items-center w-[20px] h-[40px] text-center bg-transparent hover:text-[#c9c9c9]"
            onClick={() => {
              handleCheckAll();
            }}
          >
            <SquareCheck size={20} strokeWidth={1} />
          </button>
          {workloadsEnabled && (
            <button
              className="cursor-pointer flex justify-center items-center w-[20px] h-[40px] text-center bg-transparent hover:text-[#c9c9c9]"
              onClick={() => {
                const queryKey = ["getImages", room];
                queryClient.invalidateQueries({ queryKey });
              }}
            >
              <RefreshCw size={20} strokeWidth={1} />
            </button>
          )}
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
      {!workloadsEnabled && (
        <ScrollArea className="w-full h-[calc(100%-95px)] overflow-auto">
          <div className="flex flex-col gap-2 w-full">
            <div
              className="grid grid-cols-2 gap-2 w-full weaveDraggable p-[24px]"
              onDragStart={(e) => {
                if (e.target instanceof HTMLImageElement) {
                  window.weaveDragImageURL = e.target.src;
                  window.weaveDragImageId = e.target.dataset.imageId;
                }
              }}
            >
              {appImages.length === 0 && (
                <div className="col-span-2 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                  <b className="font-normal text-[18px]">No images</b>
                  <span className="text-[14px]">
                    {aiEnabled || aiEnabledV2 ? (
                      <>
                        Add an image to the room, or
                        <br />
                        generate one from a prompt.
                      </>
                    ) : (
                      "Add an image to the room."
                    )}
                  </span>
                </div>
              )}
              <>
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
                          key={imageId}
                          className="w-full h-full object-cover"
                          draggable={
                            imagesLLMPopupVisible || imagesLLMPopupVisibleV2
                              ? "false"
                              : "true"
                          }
                          src={imageUrl}
                          data-image-id={imageId}
                          alt="An image"
                        />
                        <button
                          className="absolute bottom-[8px] right-[8px] bg-white p-2 border border-zinc-200 rounded hidden group-hover:block cursor-pointer"
                          onClick={() => {
                            if (!instance) {
                              return;
                            }

                            const node = instance
                              .getStage()
                              .findOne(`#${imageId}`);

                            if (node) {
                              const nodeHandler =
                                instance.getNodeHandler<WeaveImageNode>(
                                  node.getAttrs().nodeType
                                );
                              if (!nodeHandler) {
                                return;
                              }

                              instance.removeNode(
                                nodeHandler.serialize(
                                  node as WeaveElementInstance
                                )
                              );
                            }
                          }}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    );
                  })}
              </>
            </div>
          </div>
        </ScrollArea>
      )}
      {workloadsEnabled && (
        <ScrollArea
          className={cn("w-full h-[calc(100%-95px)] overflow-auto", {
            ["h-[calc(100%-95px)]"]: realSelectedImages.length === 0,
            ["h-[calc(100%-95px-65px)]"]: realSelectedImages.length > 0,
          })}
        >
          <div
            className="w-full weaveDraggable p-[24px]"
            onDragStart={(e) => {
              if (imagesLLMPopupVisible || imagesLLMPopupVisibleV2) {
                e.preventDefault();
                return;
              }

              if (e.target instanceof HTMLImageElement) {
                window.weaveDragImageURL = e.target.src;
                window.weaveDragImageId = e.target.dataset.imageId;
              }
            }}
          >
            {images.length === 0 && (
              <div className="col-span-1 w-full h-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
                <b className="font-normal text-[18px]">No images</b>
                <span className="text-[14px]">
                  {aiEnabled || aiEnabledV2 ? (
                    <>
                      Add an image to the room, or
                      <br />
                      generate one from a prompt.
                    </>
                  ) : (
                    "Add an image to the room."
                  )}
                </span>
              </div>
            )}
            <Masonry sequential columnsCount={2} gutter="8px">
              {images.length > 0 &&
                images.map((image) => {
                  const appImage = appImages.find(
                    (appImage) => appImage.props.imageId === image.imageId
                  );

                  const isReference = imagesReferences.find(
                    (ele) => ele.id === image.imageId
                  );

                  const isChecked = realSelectedImages.includes(image);

                  let imageComponent = (
                    <UploadedImage key={image.imageId} image={image} />
                  );

                  if (image.operation === "background-removal") {
                    imageComponent = (
                      <RemovedBackgroundImage
                        key={image.imageId}
                        image={image}
                      />
                    );
                  }

                  if (image.operation === "image-generation") {
                    imageComponent = (
                      <GeneratedImage key={image.imageId} image={image} />
                    );
                  }

                  if (image.operation === "image-edition") {
                    imageComponent = (
                      <EditImage key={image.imageId} image={image} />
                    );
                  }

                  return (
                    <div key={image.imageId} className="w-full">
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <div
                            className={cn("relative w-full", {
                              ["cursor-pointer"]: !(
                                imagesLLMPopupVisible || imagesLLMPopupVisibleV2
                              ),
                            })}
                          >
                            {imageComponent}
                            <div className="absolute top-[8px] right-[8px] z-10">
                              <Checkbox
                                id="terms"
                                className="bg-white rounded-none cursor-pointer"
                                value={image.imageId}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  handleCheckboxChange(
                                    checked as boolean,
                                    image
                                  );
                                }}
                              />
                            </div>
                            {typeof appImage !== "undefined" && (
                              <div className="absolute right-0 bottom-0 flex gap-1 justify-start items-end p-2">
                                <Badge
                                  className="px-1 font-inter tabular-nums rounded font-inter text-[11px]"
                                  variant="default"
                                >
                                  IN USE
                                </Badge>
                              </div>
                            )}
                            {typeof isReference !== "undefined" && (
                              <div className="absolute top-0 left-0 flex gap-1 justify-start items-end p-2">
                                <Badge
                                  className="px-1 font-inter tabular-nums rounded font-inter text-[11px]"
                                  variant="secondary"
                                >
                                  REFERENCED
                                </Badge>
                              </div>
                            )}
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-52 rounded-none border border-[#c9c9c9] shadow-none">
                          {typeof appImage !== "undefined" && (
                            <>
                              <ContextMenuItem
                                disabled
                                className="rounded-none uppercase font-inter text-xs"
                              >
                                <Info
                                  strokeWidth={1}
                                  size={16}
                                  className="mr-2"
                                />
                                In use
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                            </>
                          )}
                          {imagesLLMPopupVisibleV2 && (
                            <>
                              <ContextMenuItem
                                className="rounded-none uppercase font-inter text-xs"
                                onClick={() => {
                                  handleSetImageReference(image);
                                }}
                                disabled={typeof isReference !== "undefined"}
                              >
                                <Link
                                  strokeWidth={1}
                                  size={16}
                                  className="mr-2"
                                />
                                Set as reference
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="rounded-none uppercase font-inter text-xs"
                                onClick={() => {
                                  handleRemoveImageReference(image);
                                }}
                                disabled={typeof isReference === "undefined"}
                              >
                                <Unlink
                                  strokeWidth={1}
                                  size={16}
                                  className="mr-2"
                                />
                                Remove as reference
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                            </>
                          )}
                          <ContextMenuItem
                            className="rounded-none uppercase font-inter text-xs"
                            onClick={() => {
                              handleRemoveBackground(image);
                            }}
                          >
                            <BrushCleaning
                              strokeWidth={1}
                              size={16}
                              className="mr-2"
                            />
                            Remove background
                          </ContextMenuItem>
                          {typeof appImage === "undefined" && (
                            <>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                className="rounded-none uppercase font-inter text-xs"
                                disabled={typeof appImage !== "undefined"}
                                onClick={() => {
                                  handleDeleteImage(image);
                                }}
                              >
                                <Trash2
                                  strokeWidth={1}
                                  size={16}
                                  className="mr-2"
                                />
                                Delete
                              </ContextMenuItem>
                            </>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  );
                })}
            </Masonry>
            <div ref={ref} className="h-1" />
            {query.isFetchingNextPage && (
              <p className="font-inter text-base uppercase text-center mt-4">
                loading more...
              </p>
            )}
          </div>
        </ScrollArea>
      )}
      {realSelectedImages.length > 0 && (
        <div className="w-full min-h-[65px] p-3 px-6 bg-white flex justify-between items-center border-t border-[#c9c9c9]">
          <div className="font-inter text-sm">
            SELECTED {realSelectedImages.length}
          </div>
          <div className="flex gap-1 justify-end items-center">
            {inUseSelectedImages.length === 0 && (
              <Button
                size="sm"
                className="cursor-pointer rounded-none"
                variant="destructive"
                onClick={() => {
                  for (const image of realSelectedImages) {
                    handleDeleteImage(image);
                  }
                }}
              >
                <Trash strokeWidth={1} size={16} />
              </Button>
            )}
            <Button
              size="sm"
              className="cursor-pointer rounded-none"
              variant="secondary"
              onClick={() => {
                for (const image of realSelectedImages) {
                  handleRemoveBackground(image);
                }
              }}
            >
              <BrushCleaning strokeWidth={1} size={16} />
            </Button>
            {imagesLLMPopupVisibleV2 &&
              realSelectedImages.length === referencedSelectedImages.length && (
                <Button
                  size="sm"
                  className="cursor-pointer rounded-none"
                  variant="secondary"
                  onClick={() => {
                    handleRemoveImagesReference(realSelectedImages);
                  }}
                >
                  <Unlink strokeWidth={1} size={16} />
                </Button>
              )}
            {imagesLLMPopupVisibleV2 &&
              realSelectedImages.length === unreferencedSelectedImages.length &&
              realSelectedImages.length <= 4 - imagesReferences.length && (
                <Button
                  size="sm"
                  className="cursor-pointer rounded-none"
                  variant="secondary"
                  onClick={() => {
                    handleSetImagesReference(realSelectedImages);
                  }}
                >
                  <Link strokeWidth={1} size={16} />
                </Button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
