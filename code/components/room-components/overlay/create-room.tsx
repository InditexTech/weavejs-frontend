// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postRoom } from "@/api/rooms/post-room";

export type RoomKind = "showcase" | "standalone" | "templates";

type CreateRoomDialogProps = {
  kind: RoomKind;
};

export function CreateRoomDialog({ kind }: Readonly<CreateRoomDialogProps>) {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const loadingRef = React.useRef<string | number | null>(null);

  const [creating, setCreating] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>("");

  const createRoomVisible = useCollaborationRoom(
    (state) => state.rooms.create.visible,
  );
  const setRoomsCreateVisible = useCollaborationRoom(
    (state) => state.setRoomsCreateVisible,
  );

  const navigate = useNavigate();

  React.useEffect(() => {
    if (createRoomVisible) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
    }
  }, [createRoomVisible]);

  const queryClient = useQueryClient();

  const createRoom = useMutation({
    mutationFn: async ({ name, kind }: { name: string; kind: RoomKind }) => {
      setCreating(true);
      setRoomsCreateVisible(false);
      loadingRef.current = toast.loading("Creating room, please wait...");

      return await postRoom({
        name,
        kind,
      });
    },
    onSettled: () => {
      if (loadingRef.current) {
        toast.dismiss(loadingRef.current);
      }
      setCreating(false);
    },
    onSuccess: (data) => {
      const queryKey = ["getRooms"];
      queryClient.invalidateQueries({ queryKey });

      const roomId = data.room.roomId;

      switch (kind) {
        case "showcase":
          navigate({ to: `/rooms/${roomId}` });
          break;
        case "standalone":
          navigate({ to: `/use-cases/standalone/${roomId}` });
          break;
        case "templates":
          navigate({ to: `/use-cases/templates/${roomId}` });
          break;

        default:
          break;
      }
    },
    onError() {
      toast.error("Failed to create the room. Please check and try again");
    },
  });

  const handleCreateRoom = React.useCallback(() => {
    createRoom.mutate({
      name,
      kind,
    });
  }, [name, kind, createRoom]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!createRoomVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleCreateRoom();
      }
    },
    [createRoomVisible, handleCreateRoom],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={createRoomVisible}
      onOpenChange={(open) => setRoomsCreateVisible(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-3/12 max-w-3/12 translate-y-0">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Create a room
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setRoomsCreateVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
          <DialogDescription>
            To create a new room just define the room name. You'll be the owner
            of the room and you'll be able to invite other users to join the
            room once it's created.
          </DialogDescription>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <div className="grid grid-rows-1 gap-5 py-0">
            <Field>
              <FieldLabel
                htmlFor="input-demo-api-key"
                className="!justify-between"
              >
                <span>Room name</span>
                <span className="text-sm text-muted-foreground">
                  [{name.length}/120)
                </span>
              </FieldLabel>
              <Input
                ref={nameRef}
                id="room-name"
                type="text"
                maxLength={120}
                className="!rounded-none"
                placeholder="My room name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldDescription>
                The name can have a maximum of 120 characters.
              </FieldDescription>
            </Field>
          </div>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <DialogFooter className="w-full flex justify-between">
            <Button
              type="button"
              disabled={creating}
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setRoomsCreateVisible(false);
              }}
              variant="secondary"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              disabled={creating}
              className="cursor-pointer font-inter rounded-none"
              onClick={handleCreateRoom}
            >
              CREATE
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
