// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delRoom } from "@/api/rooms/del-room";
import { useLoadRoomInfo } from "../hooks/use-load-room-info";
import { DialogDescription } from "@radix-ui/react-dialog";

export function DeleteRoomDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const loadingRef = React.useRef<string | number | null>(null);

  const [archiving, setArchiving] = React.useState<boolean>(false);

  const roomId = useCollaborationRoom((state) => state.rooms.roomId);
  const deleteRoomVisible = useCollaborationRoom(
    (state) => state.rooms.delete.visible,
  );
  const setRoomsDeleteVisible = useCollaborationRoom(
    (state) => state.setRoomsDeleteVisible,
  );

  React.useEffect(() => {
    if (deleteRoomVisible) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
    }
  }, [deleteRoomVisible]);

  const { data } = useLoadRoomInfo(roomId);

  const queryClient = useQueryClient();

  const archiveRoom = useMutation({
    mutationFn: async ({ roomId }: { roomId: string }) => {
      setArchiving(true);
      setRoomsDeleteVisible(false);
      loadingRef.current = toast.loading(`Archiving the room...`);

      return await delRoom(roomId);
    },
    onSettled: () => {
      if (loadingRef.current) {
        toast.dismiss(loadingRef.current);
      }
      setArchiving(false);
    },
    onSuccess: () => {
      const queryKey = ["getRooms"];
      queryClient.invalidateQueries({ queryKey });

      toast.success(`Room archived successfully`);
    },
    onError() {
      toast.error(`Failed to archive the room. Please check and try again`);
    },
  });

  const handleArchiveRoom = React.useCallback(() => {
    archiveRoom.mutate({
      roomId: data?.room?.roomId ?? "",
    });
  }, [data, archiveRoom]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!deleteRoomVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleArchiveRoom();
      }
    },
    [deleteRoomVisible, handleArchiveRoom],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={deleteRoomVisible}
      onOpenChange={(open) => setRoomsDeleteVisible(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-3/12 max-w-3/12 translate-y-0">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Archive room
              </DialogTitle>
              <DialogClose>
                <div
                  role="button"
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setRoomsDeleteVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </div>
              </DialogClose>
            </div>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to archive the room:{" "}
            <b>{data?.room?.name ?? "loading"}</b>?
          </DialogDescription>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <DialogFooter>
            <Button
              type="button"
              disabled={archiving}
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setRoomsDeleteVisible(false);
              }}
              variant="secondary"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={archiving}
              className="cursor-pointer font-inter rounded-none"
              onClick={handleArchiveRoom}
            >
              ARCHIVE
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
