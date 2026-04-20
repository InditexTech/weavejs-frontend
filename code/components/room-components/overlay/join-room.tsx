// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
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
import { Field, FieldLabel } from "@/components/ui/field";

export function JoinRoomDialog() {
  const accessCodeRef = React.useRef<HTMLInputElement>(null);

  const [accessCode, setAccessCode] = React.useState<string>("");

  const joinRoomVisible = useCollaborationRoom(
    (state) => state.rooms.join.visible,
  );
  const setRoomsJoinVisible = useCollaborationRoom(
    (state) => state.setRoomsJoinVisible,
  );

  const navigate = useNavigate();

  React.useEffect(() => {
    if (joinRoomVisible) {
      setTimeout(() => {
        accessCodeRef.current?.focus();
      }, 0);
    }
  }, [joinRoomVisible]);

  const handleJoinRoom = React.useCallback(() => {
    setRoomsJoinVisible(false);
    navigate({ to: `/rooms/access-link?p=${accessCode}` });
  }, [accessCode, setRoomsJoinVisible, navigate]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!joinRoomVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleJoinRoom();
      }
    },
    [joinRoomVisible, handleJoinRoom],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={joinRoomVisible}
      onOpenChange={(open) => setRoomsJoinVisible(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-3/12 max-w-3/12 translate-y-0">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Join a room
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setRoomsJoinVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
          <DialogDescription>
            To join an already created room just provide the room access code.
            Room owners or any of the room participants can create an access
            code to the room. Ask them for it and input it here to join the room
            directly.
          </DialogDescription>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <div className="grid grid-rows-1 gap-5 py-0">
            <Field>
              <FieldLabel htmlFor="input-demo-api-key">
                Room Access Code
              </FieldLabel>
              <Input
                ref={accessCodeRef}
                id="room-access-code"
                type="text"
                className="!rounded-none"
                placeholder="Provided room access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </Field>
          </div>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <DialogFooter className="w-full flex justify-between">
            <Button
              type="button"
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setRoomsJoinVisible(false);
              }}
              variant="secondary"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              className="cursor-pointer font-inter rounded-none"
              onClick={handleJoinRoom}
            >
              JOIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
