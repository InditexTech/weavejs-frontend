"use client";

import React from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { ImagePlus, Trash } from "lucide-react";
import { useWeave } from "@inditextech/weavejs-react";
import { useCollaborationRoom } from "@/store/store";
import { getImages } from "@/api/get-images";
import { postImage } from "@/api/post-image";
import { delImage } from "@/api/del-image";

export const ImagesLibrary = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const imagesLibraryVisible = useCollaborationRoom((state) => state.images.library.visible);

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    }
  });

  const mutationDelete = useMutation({
    mutationFn: async (imageId: string) => {
      return await delImage(room ?? "", imageId);
    }
  });

  const query = useInfiniteQuery({
    queryKey: ["getImages", room],
    queryFn: async ({ pageParam }) => {
      if (!room) {
        return [];
      }
      return await getImages(room ?? "", 20, pageParam);
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) =>
      lastPage.continuationToken,
  })

  const linearData = React.useMemo(() => {
    return query.data?.pages.flatMap((page) => page.images) ?? [];
  }, [query.data]);

  if (!instance) {
    return null;
  }

  if (!imagesLibraryVisible) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-full h-full">
      <div className="w-full font-title-xs p-4 py-3 border-b border-light-border-3 bg-light-background-2 flex justify-between items-center">
        <div className="flex justify-between items-center text-sm">Images</div>
        <div className="flex justify-end items-center gap-1">
          <input
            type="file"
            accept="image/png,image/gif,image/jpeg"
            name="image"
            ref={inputFileRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                mutationUpload.mutate(file, {
                  onSuccess: () => {
                    query.refetch();
                  }
                });
              }
            }}
          />
          <button
            className="cursor-pointer bg-transparent hover:text-light-content-3"
            onClick={() => {
              if (inputFileRef.current) {
                inputFileRef.current.click();
                // instance.triggerAction("imageTool");
              }
            }}
          >
            <ImagePlus size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full h-[calc(100%-50px)]">
        <div
          className="grid grid-cols-2 gap-2 w-full weaveDraggable p-4"
          onDragStart={(e) => {
            if (e.target instanceof HTMLImageElement) {
              window.weaveDragImageURL = e.target.src;
            }
          }}
        >
          {linearData.length === 0 && (
            <div className="col-span-2 w-full flex flex-col justify-center items-center text-sm py-5 text-center">
              <b>No images available</b>
              <span className="text-xs">Upload an image to the room</span>
            </div>
          )}
          {linearData.length > 0 && linearData.map((image) => {
            const imageUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/images/${image}`;

            return (
              <div key={image} className="group w-full h-[100px] bg-light-background-1 object-cover cursor-pointer border border-zinc-300 relative">
                <img
                  className="w-full h-full object-cover"
                  draggable="true"
                  src={imageUrl}
                />
                <button className="absolute bottom-[8px] right-[8px] bg-white p-2 border border-zinc-300 rounded hidden group-hover:block cursor-pointer" onClick={() => {
                  mutationDelete.mutate(image, {
                    onSuccess: () => {
                      query.refetch();
                    }
                  });
                }}><Trash size={16} /></button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};
