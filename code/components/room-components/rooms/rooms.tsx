// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useOnInView } from "react-intersection-observer";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { getRooms } from "@/api/rooms/get-rooms";
import { Button } from "@/components/ui/button";
import { FilePlus, LoaderCircle, Search, UserPlus, X } from "lucide-react";
import { Divider } from "../overlay/divider";
import { useGetSession } from "../hooks/use-get-session";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { RoomPage } from "./room.page";
import { useDebounce } from "../hooks/use-debounce";
import { RoomKind } from "../overlay/create-room";
import { cn } from "@/lib/utils";

const ROOMS_LIMIT = 20;

type RoomsProps = {
  kind: RoomKind;
};

export const Rooms = ({ kind }: Readonly<RoomsProps>) => {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const [root, setRoot] = React.useState<Element | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomsStoreRef = React.useRef(new Map<string, any>());
  const [forceRender, setForceRender] = React.useState(0);

  const searchText = useCollaborationRoom(
    (state) => state.rooms.filters.searchText,
  );
  const statusFilter = useCollaborationRoom(
    (state) => state.rooms.filters.status,
  );
  const setSearchText = useCollaborationRoom(
    (state) => state.setRoomsSearchTextFilter,
  );
  const setStatusFilter = useCollaborationRoom(
    (state) => state.setRoomsStatusFilter,
  );
  const setRoomsCreateVisible = useCollaborationRoom(
    (state) => state.setRoomsCreateVisible,
  );
  const setRoomsJoinVisible = useCollaborationRoom(
    (state) => state.setRoomsJoinVisible,
  );

  const { session, isPending } = useGetSession();

  const { data: availableRooms, isFetching: availableRoomsFetching } = useQuery(
    {
      queryKey: ["availableRooms", kind],
      queryFn: async () => {
        return await getRooms(0, ROOMS_LIMIT, { kind });
      },
      initialData: undefined,
      staleTime: 0,
      gcTime: 0,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: !isPending && !!session?.user,
    },
  );

  const amountOfRooms = React.useMemo(() => {
    return availableRooms?.total ?? 0;
  }, [availableRooms]);

  const debouncedQuery = useDebounce(searchText, 500);

  const query = useInfiniteQuery({
    queryKey: ["getRooms", kind, debouncedQuery, statusFilter],
    queryFn: async ({ pageParam }) => {
      return await getRooms(pageParam, ROOMS_LIMIT, {
        name: searchText,
        status: statusFilter === "all" ? undefined : statusFilter,
        kind,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedSoFar = allPages.reduce(
        (sum, page) => sum + page?.items?.length,
        0,
      );
      if (loadedSoFar < lastPage.total) {
        return loadedSoFar; // next offset
      }
      return undefined; // no more pages
    },
    refetchOnWindowFocus: false,
    enabled: !isPending && !!session?.user,
  });

  React.useEffect(() => {
    if (!query.data) return;

    const store = roomsStoreRef.current;
    const nextIds = new Set<string>();

    for (const page of query.data.pages) {
      for (const room of page.items) {
        const roomId = room.roomId;

        nextIds.add(roomId);

        const existing = store.get(roomId);

        // ADD
        if (!existing) {
          store.set(roomId, room);
          continue;
        }

        // UPDATE (only if something changed)
        if (existing.status !== roomId.status) {
          store.set(roomId, room);
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

  const roomsToRender = React.useMemo(() => {
    const unsortedRooms = [...Array.from(roomsStoreRef.current.values())];
    const sortedRooms = unsortedRooms.toSorted((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sortedRooms;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRender]);

  React.useEffect(() => {
    if (viewportRef.current && !query.isFetching) {
      setRoot(viewportRef.current);
    }
  }, [roomsToRender, query.isFetching]);

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

  return (
    <div className="w-full h-full block pointer-events-auto">
      {availableRoomsFetching && (
        <div className="w-full h-full flex flex-col justify-center items-center gap-3">
          <LoaderCircle strokeWidth={1} size={48} className="animate-spin" />
          <p className="font-light text-lg text-[#757575]">LOADING ROOMS</p>
        </div>
      )}
      {!availableRoomsFetching && amountOfRooms === 0 && (
        <div className="w-full h-full flex flex-col gap-3 justify-center items-center text-sm text-center font-inter font-light">
          <div className="max-w-lg w-96 h-full flex flex-col gap-8 justify-center items-center font-light">
            <div className="w-full flex flex-col gap-5 justify-center items-center">
              <FilePlus size={48} strokeWidth={1} />
              <b className="font-normal text-base text-[#757575]">
                {kind === "showcase" && (
                  <>
                    The easiest way to start the <b>showcase</b> example
                    <br />
                    is by <u>creating a room</u>, just define a name for it.
                  </>
                )}
                {kind === "standalone" && (
                  <>
                    The easiest way to start the <b>standalone</b> example
                    <br />
                    is by <u>creating a room</u>, just define a name for it.
                  </>
                )}
                {kind === "templates" && (
                  <>
                    The easiest way to start the <b>templates</b> example
                    <br />
                    is by <u>creating a room</u>, just define a name for it.
                  </>
                )}
              </b>
              <Button
                className="cursor-pointer font-inter font-light rounded-none"
                onClick={async () => {
                  setRoomsCreateVisible(true);
                }}
              >
                CREATE A ROOM
              </Button>
            </div>
            <Divider className="h-[1px] w-full" />
            <div className="w-full flex flex-col gap-5 justify-center items-center">
              <UserPlus size={48} strokeWidth={1} />
              <b className="font-normal text-base text-[#757575]">
                {kind === "showcase" && (
                  <>
                    Enter to another user <b>showcase</b> example
                    <br />
                    by <u>joining a room</u>, the owner or any participant of
                    the room must share a code with you that will allow you to
                    join it.
                  </>
                )}
                {kind === "standalone" && (
                  <>
                    Enter to another user <b>standalone</b> example
                    <br />
                    by <u>joining a room</u>, the owner or any participant of
                    the room must share a code with you that will allow you to
                    join it.
                  </>
                )}
                {kind === "templates" && (
                  <>
                    Enter to another user <b>templates</b> example
                    <br />
                    by <u>joining a room</u>, the owner or any participant of
                    the room must share a code with you that will allow you to
                    join it.
                  </>
                )}
              </b>
              <Button
                className="cursor-pointer font-inter font-light rounded-none"
                onClick={async () => {
                  setRoomsJoinVisible(true);
                }}
              >
                JOIN A ROOM
              </Button>
            </div>
          </div>
        </div>
      )}
      {!availableRoomsFetching && amountOfRooms > 0 && (
        <>
          <div className="bg-white flex gap-5">
            <div className="w-full flex gap-2 p-5 border-b-[0.5px] border-[#c9c9c9]">
              <InputGroup className="w-full flex gap-0 rounded-none h-[40px] !shadow-none">
                <InputGroupAddon align="inline-start">
                  <Search size={20} strokeWidth={1} />
                </InputGroupAddon>
                <InputGroupInput
                  ref={searchInputRef}
                  id="room-search"
                  type="text"
                  placeholder="Type to search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                {searchText !== "" && (
                  <InputGroupAddon align="inline-end">
                    <button
                      className="cursor-pointer"
                      onClick={() => {
                        setSearchText("");
                        searchInputRef.current?.focus();
                      }}
                    >
                      <X size={20} strokeWidth={1} />
                    </button>
                  </InputGroupAddon>
                )}
              </InputGroup>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="cursor-pointer font-inter text-sm rounded-none w-[200px] !h-[40px] !shadow-none">
                  <SelectValue placeholder="Amount" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] !shadow-none"
                  align="end"
                >
                  <SelectGroup>
                    <SelectItem
                      value="all"
                      className="cursor-pointer font-inter text-xs rounded-none"
                    >
                      All rooms
                    </SelectItem>
                    <SelectItem
                      value="active"
                      className="cursor-pointer font-inter text-xs rounded-none"
                    >
                      Active rooms
                    </SelectItem>
                    <SelectItem
                      value="archived"
                      className="cursor-pointer font-inter text-xs rounded-none"
                    >
                      Archived rooms
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          {query.isFetching && (
            <div className="w-full h-[calc(100%-80px-80px-2px)] flex flex-col justify-center items-center gap-3">
              <LoaderCircle
                strokeWidth={1}
                size={48}
                className="animate-spin"
              />
              <p className="font-light text-lg text-[#757575]">LOADING ROOMS</p>
            </div>
          )}
          {!query.isFetching && roomsToRender.length === 0 && (
            <div className="w-full h-[calc(100%-80px-1px)] flex flex-col justify-center items-center gap-8">
              <div className="flex flex-col justify-center items-center gap-3">
                <Search size={48} strokeWidth={1} className="text-[#757575]" />
                <p className="font-light text-lg text-[#757575]">
                  NO ROOMS CREATED
                </p>
              </div>
              <Divider className="h-[1px] w-[320px]" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    className="cursor-pointer rounded-none"
                    size="sm"
                    onClick={() => {
                      setRoomsCreateVisible(true);
                    }}
                  >
                    CREATE A ROOM
                  </Button>
                  <Button
                    className="cursor-pointer rounded-none"
                    size="sm"
                    onClick={() => {
                      setRoomsJoinVisible(true);
                    }}
                  >
                    JOIN A ROOM
                  </Button>
                </div>
              </div>
            </div>
          )}
          {!query.isFetching && roomsToRender.length > 0 && (
            <ScrollArea.Root className="w-full h-[calc(100%-80px-80px-2px)] overflow-hidden">
              <ScrollArea.Viewport className="h-full" ref={viewportRef}>
                <div className="@container w-full p-0">
                  <div
                    className={cn("w-full grid p-5", {
                      ["grid-cols-1 @min-[800px]:grid-cols-2 @min-[1200px]:grid-cols-3 @min-[1600px]:grid-cols-4 gap-5"]:
                        kind === "showcase",
                      ["grid-cols-1 gap-3"]: [
                        "standalone",
                        "templates",
                      ].includes(kind),
                    })}
                  >
                    {/* <button
                    className="aspect-video border-[0.5px] border-[#c9c9c9] flex justify-center items-center hover:bg-[#f0f0f0]/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setRoomsCreateVisible(true);
                    }}
                  >
                    <Plus strokeWidth={1} size={40} />
                  </button> */}
                    {roomsToRender.map((room) => {
                      return (
                        <RoomPage
                          key={`${room.roomId}`}
                          room={room}
                          kind={kind}
                        />
                      );
                    })}
                  </div>
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
          <div className="w-full p-5 flex justify-between items-center border-t-[0.5px] border-[#c9c9c9]">
            <div className="flex gap-2">
              <Button
                className="cursor-pointer rounded-none"
                size="sm"
                onClick={() => {
                  setRoomsCreateVisible(true);
                }}
              >
                CREATE A ROOM
              </Button>
              <Button
                className="cursor-pointer rounded-none"
                size="sm"
                onClick={() => {
                  setRoomsJoinVisible(true);
                }}
              >
                JOIN A ROOM
              </Button>
            </div>
            <div className="font-light text-sm">
              {!query.isFetching && (
                <span>{query.data?.pages?.[0]?.total} room(s)</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
