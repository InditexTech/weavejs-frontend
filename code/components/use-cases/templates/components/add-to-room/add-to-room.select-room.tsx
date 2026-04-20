// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplatesUseCase } from "../../store/store";
import { getRooms } from "@/api/rooms/get-rooms";
import { cn } from "@/lib/utils";
import { useAddToRoom } from "../../store/add-to-room";
import { CheckIcon } from "lucide-react";

const ROOMS_LIMIT = 100;

export function AddToRoomSelectRoom() {
  const addToRoomOpen = useTemplatesUseCase((state) => state.addToRoom.open);

  const room = useAddToRoom((state) => state.room);
  const setRoom = useAddToRoom((state) => state.setRoom);
  const setStep = useAddToRoom((state) => state.setStep);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rooms, setRooms] = React.useState<any[]>([]);

  const query = useInfiniteQuery({
    queryKey: ["getRooms"],
    queryFn: async ({ pageParam }) => {
      return await getRooms(pageParam, ROOMS_LIMIT);
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
    setRooms(query.data?.pages.flatMap((page) => page.items) ?? []);
  }, [query.data]);

  const { ref, inView } = useInView({ threshold: 1 });

  React.useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query]);

  return (
    <>
      <div className="w-full h-full grid grid-cols grid-rows-[auto_1fr] gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Select the room where you want to add the template.
        </DialogDescription>
        <div className="w-full h-[calc(100dvh-48px-12px-72px-25px-48px-140px-48px)] border border-[#c9c9c9]">
          <ScrollArea className="w-full h-full">
            {rooms.length > 0 &&
              rooms.map((roomInfo, index) => {
                return (
                  <div
                    key={roomInfo.roomId}
                    className={cn(
                      "flex gap-3 h-[40px] justify-between items-center font-inter text-sm p-2 py-2 cursor-pointer border-t border-[#c9c9c9]",
                      {
                        ["border-t-0"]: index === 0,
                      },
                    )}
                    onClick={() => {
                      setRoom({
                        id: roomInfo.roomId,
                        name: roomInfo.name,
                        create: false,
                      });
                    }}
                  >
                    <div>{roomInfo?.name}</div>
                    {room?.id === roomInfo?.roomId && (
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
      </div>
      <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
      <DialogFooter>
        <Button
          type="button"
          className="cursor-pointer font-inter rounded-none"
          disabled={!room || room.id.trim() === ""}
          onClick={() => {
            setStep("select-page");
          }}
        >
          CONTINUE
        </Button>
      </DialogFooter>
    </>
  );
}
