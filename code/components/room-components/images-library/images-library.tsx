// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useOnInView } from "react-intersection-observer";
import Masonry from "react-responsive-masonry";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import {
  BrushCleaning,
  Info,
  SquareCheck,
  SquareX,
  Trash2,
} from "lucide-react";
import {
  WeaveStateElement,
  WeaveElementAttributes,
} from "@inditextech/weave-types";
import { delImage } from "@/api/v2/del-image";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
  // Weave,
  WeaveImagesToolAction,
  WeaveImageToolAction,
  WeaveImagesURL,
} from "@inditextech/weave-sdk";
import { getImages } from "@/api/get-images";
import { getImages as getImagesV2 } from "@/api/v2/get-images";
import { postRemoveBackground as postRemoveBackgroundV2 } from "@/api/v2/post-remove-background";
import { UploadedImage } from "./uploaded.image";
import { GeneratedImage } from "./generated-image.image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { ImageEntity } from "./types";
import { ImagesLibraryActions } from "./images-library.actions";
import { SidebarHeader } from "../sidebar-header";
import { useIAChat } from "@/store/ia-chat";
import { useGetSession } from "../hooks/use-get-session";

const IMAGES_LIMIT = 20;

export const ImagesLibrary = () => {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const [root, setRoot] = React.useState<Element | null>(null);

  const instance = useWeave((state) => state.instance);
  const appState = useWeave((state) => state.appState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageStoreRef = React.useRef(new Map<string, any>());
  const [forceRender, setForceRender] = React.useState(0);

  const [selectedImages, setSelectedImages] = React.useState<ImageEntity[]>([]);
  // const [images, setImages] = React.useState<ImageEntity[]>([]);
  const [showSelection, setShowSelection] = React.useState<boolean>(false);

  const { session } = useGetSession();

  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads,
  );

  const aiChatEnabled = useIAChat((state) => state.enabled);

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
        image,
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting images background removal...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting images background removal.");
    },
  });

  const mutationDelete = useMutation({
    mutationFn: async (imageId: string) => {
      return await delImage(
        session?.user.id ?? "",
        clientId ?? "",
        room ?? "",
        imageId,
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Requesting images deletion...");
      return { toastId };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: (_, __, ___, context: any) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
    onError() {
      toast.error("Error requesting images deletion.");
    },
  });

  const handleDeleteImage = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (image: any) => {
      if (!instance) {
        return;
      }

      mutationDelete.mutate(image.imageId);
    },
    [instance, mutationDelete],
  );

  const handleRemoveBackground = React.useCallback(
    (image: ImageEntity) => {
      if (!instance) {
        return;
      }

      const element = document.querySelector(
        `img[id="${image.imageId}"]`,
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

        mutationUploadV2.mutate({
          userId: session?.user.id ?? "",
          clientId: clientId ?? "",
          imageId: uuidv4(),
          image: {
            dataBase64,
            contentType: "image/png",
          },
        });
      }
    },
    [instance, clientId, session, mutationUploadV2],
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
      return await getImages(room ?? "", IMAGES_LIMIT, pageParam as string);
    },
    initialPageParam: workloadsEnabled ? 0 : "",
    getNextPageParam: (lastPage, allPages) => {
      if (!workloadsEnabled) {
        return lastPage.continuationToken;
      }
      const loadedSoFar = allPages.reduce(
        (sum, page) => sum + page.items.length,
        0,
      );
      if (loadedSoFar < lastPage.total) {
        return loadedSoFar; // next offset
      }
      return undefined; // no more pages
    },
    refetchOnWindowFocus: false,
    enabled: sidebarActive === "images",
  });

  React.useEffect(() => {
    if (!query.data) return;

    const store = imageStoreRef.current;
    const nextIds = new Set<string>();

    for (const page of query.data.pages) {
      for (const img of page.items) {
        const imageId = img.imageId;

        nextIds.add(imageId);

        const existing = store.get(imageId);

        // ADD
        if (!existing) {
          store.set(imageId, img);
          continue;
        }

        // UPDATE (only if something changed)
        if (existing.status !== img.status) {
          store.set(imageId, img);
        }
      }
    }

    // REMOVE
    for (const id of store.keys()) {
      if (!nextIds.has(id)) {
        store.delete(id);
      }
    }

    setForceRender((v) => v + 1);
  }, [query.data]);

  const appImages = React.useMemo(() => {
    function extractImages(
      images: WeaveStateElement[],
      node: WeaveStateElement,
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

  // React.useEffect(() => {
  //   if (!query.data) return;
  //   setImages((prev: ImageEntity[]) =>
  //     (query.data?.pages.flatMap((page) => page.items) ?? []).map(
  //       (newItem: ImageEntity) =>
  //         prev.find(
  //           (oldItem) =>
  //             oldItem.imageId === newItem.imageId &&
  //             oldItem.updatedAt === newItem.updatedAt,
  //         ) || newItem,xw
  //     ),
  //   );
  // }, [query.data]);

  const imagesToRender = React.useMemo(() => {
    const unsortedImages = [...Array.from(imageStoreRef.current.values())];
    const sortedImages = unsortedImages.toSorted((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sortedImages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRender]);

  React.useEffect(() => {
    if (viewportRef.current && !query.isFetching) {
      setRoot(viewportRef.current);
    }
  }, [workloadsEnabled, imagesToRender, query.isFetching]);

  const ref = useOnInView(
    (inView) => {
      if (inView) {
        query.fetchNextPage();
      }
    },
    {
      threshold: 0.1,
      rootMargin: "0px",
      root,
      skip: !root,
      trackVisibility: true,
      delay: 500,
    },
  );

  const realSelectedImages = React.useMemo(() => {
    return selectedImages.filter((image) => imagesToRender.includes(image));
  }, [selectedImages, imagesToRender]);

  const handleCheckNone = React.useCallback(() => {
    setSelectedImages([]);
  }, []);

  const handleCheckAll = React.useCallback(() => {
    const newSelectedImages = [];

    for (const image of imagesToRender) {
      const appImage = appImages.find(
        (appImage) => appImage.props.imageId === image.imageId,
      );

      if (
        typeof appImage === "undefined" &&
        ["completed"].includes(image.status) &&
        image.removalJobId === null
      ) {
        newSelectedImages.push(image);
      }
    }

    setSelectedImages(newSelectedImages);
  }, [imagesToRender, appImages]);

  const handleCheckboxChange = React.useCallback(
    (checked: boolean, image: ImageEntity) => {
      let newSelectedImages = [...selectedImages];
      if (checked) {
        newSelectedImages.push(image);
      } else {
        newSelectedImages = newSelectedImages.filter(
          (actImage) => actImage !== image,
        );
      }
      const unique = [...new Set(newSelectedImages)];
      setSelectedImages(unique);
    },
    [selectedImages],
  );

  if (!instance) {
    return null;
  }

  // if (sidebarActive !== SIDEBAR_ELEMENTS.images) {
  //   return null;
  // }

  return (
    <div
      className={cn("w-full h-full", {
        ["hidden pointer-events-none"]:
          sidebarActive !== SIDEBAR_ELEMENTS.images,
        ["block pointer-events-auto"]:
          sidebarActive === SIDEBAR_ELEMENTS.images,
      })}
    >
      <SidebarHeader
        actions={
          <div className="flex justify-end items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="selection-mode"
                checked={showSelection}
                onCheckedChange={(checked) => {
                  setShowSelection(checked);
                  if (!checked) {
                    setSelectedImages([]);
                  }
                }}
                className="w-[32px] cursor-pointer"
              />
              <Label
                htmlFor="selection-mode"
                className="!font-inter !text-xs cursor-pointer"
              >
                SELECTION
              </Label>
            </div>
          </div>
        }
      >
        <SidebarSelector title="Images" />
      </SidebarHeader>
      {showSelection && (
        <div className="w-full h-[40px] p-0 px-6 bg-white flex justify-between items-center border-b-[0.5px] border-[#c9c9c9]">
          <div className="flex gap-1 justify-start items-center font-inter font-light text-xs">
            SELECTED{" "}
            <Badge className="font-inter text-xs">
              {realSelectedImages.length}
            </Badge>
          </div>
          <div className="flex gap-2 justify-end items-center">
            <button
              className="cursor-pointer flex gap-1 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
              onClick={() => {
                handleCheckNone();
              }}
            >
              <span>NONE</span> <SquareX size={20} strokeWidth={1} />
            </button>
            <button
              className="cursor-pointer flex gap-1 justify-center items-center h-[40px] font-inter text-xs text-center bg-transparent hover:text-[#c9c9c9]"
              onClick={() => {
                handleCheckAll();
              }}
            >
              <span>ALL</span>
              <SquareCheck size={20} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}
      {workloadsEnabled && (
        <>
          {imagesToRender.length === 0 && (
            <div className="col-span-1 w-full h-[calc(100%-57px)] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
              <b className="font-normal text-[18px]">No images</b>
              <span className="text-[14px]">
                {aiChatEnabled ? (
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
          {imagesToRender.length > 0 && (
            <ScrollArea.Root
              className={cn("w-full overflow-hidden", {
                ["h-[calc(100%-57px-40px-40px)]"]: showSelection,
                ["h-[calc(100%-57px)]"]: !showSelection,
              })}
            >
              <ScrollArea.Viewport className="h-full" ref={viewportRef}>
                <div
                  className="w-full weaveDraggable p-0"
                  onDragStart={async (e) => {
                    if (!instance) {
                      return;
                    }

                    if (selectedImages.length > 1) {
                      const imagesTool = instance.getActionHandler(
                        WEAVE_IMAGES_TOOL_ACTION_NAME,
                      ) as WeaveImagesToolAction | undefined;

                      if (!imagesTool) {
                        return;
                      }

                      const images: WeaveImagesURL[] = [];

                      for (const image of selectedImages) {
                        const imageId = uuidv4();
                        const imageSize = {
                          width: image.width ?? 0,
                          height: image.height ?? 0,
                        };
                        const imageDom = document.getElementById(image.imageId);

                        if (!imageDom) {
                          continue;
                        }

                        const apiEndpoint = import.meta.env
                          .VITE_API_V2_ENDPOINT;

                        const imageURL = `${apiEndpoint}/weavejs/rooms/${image.roomId}/images/${image.imageId}`;

                        images.push({
                          url: imageURL,
                          fallback: imageDom.dataset.imageFallback ?? "",
                          width: imageSize.width,
                          height: imageSize.height,
                          imageId,
                        });
                      }

                      imagesTool.setDragAndDropProperties({
                        imagesURL: images,
                      });
                      return;
                    }

                    if (e.target instanceof HTMLImageElement) {
                      const imageTool = instance.getActionHandler(
                        WEAVE_IMAGE_TOOL_ACTION_NAME,
                      ) as WeaveImageToolAction | undefined;

                      if (!imageTool) {
                        return;
                      }

                      if (
                        !e.target.dataset.imageUrl ||
                        !e.target.dataset.imageFallback
                      ) {
                        return;
                      }

                      imageTool.setDragAndDropProperties({
                        imageURL: {
                          url: e.target.dataset.imageUrl,
                          fallback: e.target.dataset.imageFallback,
                          width: e.target.naturalWidth,
                          height: e.target.naturalHeight,
                        },
                        imageId: e.target.dataset.imageId,
                      });
                    }
                  }}
                >
                  <Masonry
                    columnsCount={2}
                    gutter="1px"
                    className="w-full min-h-[calc(100%)]"
                  >
                    {imagesToRender.map((image) => {
                      const appImage = appImages.find(
                        (appImage) => appImage.props.imageId === image.imageId,
                      );

                      const isChecked = realSelectedImages.includes(image);

                      let imageComponent = (
                        <UploadedImage selected={isChecked} image={image} />
                      );

                      if (
                        [
                          "negate-image",
                          "flip-image",
                          "grayscale-image",
                          "background-removal",
                          "image-generation",
                          "image-edition",
                        ].includes(image.operation)
                      ) {
                        imageComponent = (
                          <GeneratedImage selected={isChecked} image={image} />
                        );
                      }

                      return (
                        <div
                          key={`${image.imageId}-${image.status}`}
                          className="w-full min-h-[200px]"
                          onClick={() => {
                            if (
                              showSelection &&
                              !(
                                ["pending", "working"].includes(image.status) ||
                                (image.removalJobId !== null &&
                                  image.removalStatus !== null &&
                                  ["pending", "working"].includes(
                                    image.removalStatus,
                                  ))
                              )
                            ) {
                              handleCheckboxChange(!isChecked, image);
                            }
                          }}
                        >
                          <ContextMenu>
                            <ContextMenuTrigger>
                              <div className="group relative w-full">
                                {imageComponent}
                                {showSelection &&
                                  typeof appImage === "undefined" &&
                                  !(
                                    ["pending", "working"].includes(
                                      image.status,
                                    ) ||
                                    (image.removalJobId !== null &&
                                      image.removalStatus !== null &&
                                      ["pending", "working"].includes(
                                        image.removalStatus,
                                      ))
                                  ) && (
                                    <div className="absolute top-[8px] right-[8px] z-10">
                                      <Checkbox
                                        id="terms"
                                        className="bg-white rounded-none cursor-pointer"
                                        value={image.imageId}
                                        checked={isChecked}
                                        onCheckedChange={(checked: boolean) => {
                                          handleCheckboxChange(checked, image);
                                        }}
                                      />
                                    </div>
                                  )}
                                {typeof appImage !== "undefined" && (
                                  <div className="absolute right-0 bottom-0 hidden group-hover:flex gap-1 justify-start items-end p-2">
                                    <Badge
                                      className="px-1 font-inter tabular-nums rounded font-inter text-[11px]"
                                      variant="default"
                                    >
                                      IN USE
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-52 rounded-none border-0 border-[#c9c9c9] shadow-none">
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
                              {["completed"].includes(image.status) && (
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
                              )}
                              {typeof appImage === "undefined" && (
                                <>
                                  {["completed"].includes(image.status) && (
                                    <ContextMenuSeparator />
                                  )}
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
                </div>
                {!query.isFetching &&
                  !query.isFetchingNextPage &&
                  query.hasNextPage && (
                    <div
                      ref={(el) => {
                        ref(el);
                      }}
                      className="w-full h-[1px]"
                    />
                  )}
                {query.isFetchingNextPage && (
                  <p className="font-inter text-xs uppercase text-center py-4">
                    loading more...
                  </p>
                )}
              </ScrollArea.Viewport>

              <ScrollArea.Scrollbar orientation="vertical" />
            </ScrollArea.Root>
          )}
        </>
      )}
      {showSelection && (
        <ImagesLibraryActions
          images={imagesToRender}
          appImages={appImages}
          selectedImages={selectedImages}
          setShowSelection={setShowSelection}
          setSelectedImages={setSelectedImages}
        />
      )}
    </div>
  );
};
