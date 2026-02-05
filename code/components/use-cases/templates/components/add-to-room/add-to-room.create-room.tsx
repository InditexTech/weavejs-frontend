// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useAddToRoom } from "../../store/add-to-room";

export function AddToRoomCreateRoom() {
  const room = useAddToRoom((state) => state.room);
  const setStep = useAddToRoom((state) => state.setStep);
  const setRoom = useAddToRoom((state) => state.setRoom);

  const roomName = React.useMemo(() => {
    return room ? room.id : "";
  }, [room]);

  return (
    <>
      <div className="grid grid-cols gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Define the name of the room to create.
        </DialogDescription>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col justify-start items-start gap-0">
            <Label className="mb-2">Room name</Label>
            <Input
              type="text"
              className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
              value={roomName}
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
        <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
        <DialogFooter>
          <Button
            type="button"
            className="cursor-pointer font-inter rounded-none"
            onClick={() => {
              setStep("select-template");
            }}
          >
            SAVE
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
