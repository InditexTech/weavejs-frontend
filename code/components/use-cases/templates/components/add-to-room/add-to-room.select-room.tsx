// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplatesUseCase } from "../../store/store";
import { getRooms } from "@/api/get-rooms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAddToRoom } from "../../store/add-to-room";
import { CheckIcon } from "lucide-react";

const ROOMS_LIMIT = 100;

export function AddToRoomSelectRoom() {
  const addToRoomOpen = useTemplatesUseCase((state) => state.addToRoom.open);

  const room = useAddToRoom((state) => state.room);
  const setRoom = useAddToRoom((state) => state.setRoom);
  const setStep = useAddToRoom((state) => state.setStep);

  const [rooms, setRooms] = React.useState<string[]>([]);

  const query = useInfiniteQuery({
    queryKey: ["getRooms"],
    queryFn: async ({ pageParam }) => {
      return await getRooms(ROOMS_LIMIT, pageParam as string | undefined);
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.continuationToken === ""
        ? undefined
        : lastPage.continuationToken;
    },
    enabled: addToRoomOpen,
  });

  React.useEffect(() => {
    if (!query.data) return;
    setRooms(query.data?.pages.flatMap((page) => page.rooms) ?? []);
  }, [query.data]);

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  const roomName = React.useMemo(() => {
    return room ? room.id : "";
  }, [room]);

  const isCreatingNewRoom = React.useMemo(() => {
    return room ? room.create : false;
  }, [room]);

  return (
    <>
      <div className="w-full h-full grid grid-cols grid-rows-[auto_1fr_auto_auto] gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Select the room where you want to add the template.
        </DialogDescription>
        <div className="w-full h-[calc(100dvh-48px-32px-72px-20px-20px-62px-25px-48px-140px-500px)] border border-[#c9c9c9]">
          <ScrollArea className="w-full h-full">
            {rooms.length > 0 &&
              rooms.map((room, index) => {
                return (
                  <div
                    key={room}
                    className={cn(
                      "flex gap-3 justify-between items-center font-inter text-xl p-5 py-3 cursor-pointer border-t border-[#c9c9c9]",
                      {
                        ["border-t-0"]: index === 0,
                      },
                    )}
                    onClick={() => {
                      setRoom({ id: room, create: false });
                    }}
                  >
                    <div>{room}</div>
                    {roomName === room && (
                      <div>
                        <CheckIcon strokeWidth={1} />
                      </div>
                    )}
                  </div>
                );
              })}
            <div ref={ref} className="h-[0px]" />
            {query.isFetchingNextPage && (
              <p className="font-inter text-xs uppercase text-center py-4">
                loading more...
              </p>
            )}
          </ScrollArea>
        </div>
        <DialogDescription className="font-inter text-sm my-0">
          Or you can also create a new room.
        </DialogDescription>
        <div className="grid grid-cols-1 gap-5">
          <div className="flex flex-col justify-start items-start gap-0">
            <Label className="mb-2">Room name</Label>
            <Input
              type="text"
              className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
              value={isCreatingNewRoom ? roomName : ""}
              onChange={(e) => {
                setRoom({ id: e.target.value, create: true });
              }}
              onFocus={() => {
                window.weaveOnFieldFocus = true;
              }}
              onBlurCapture={() => {
                window.weaveOnFieldFocus = false;
              }}
            />
          </div>
        </div>
      </div>
      <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
      <DialogFooter>
        <Button
          type="button"
          className="cursor-pointer font-inter rounded-none"
          disabled={!room || room.id.trim() === ""}
          onClick={() => {
            setStep("select-template");
          }}
        >
          CONTINUE
        </Button>
      </DialogFooter>
    </>
  );
}
