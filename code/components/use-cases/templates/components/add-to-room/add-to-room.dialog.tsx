// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { X } from "lucide-react";
import { useTemplatesUseCase } from "../../store/store";
import { useAddToRoom } from "../../store/add-to-room";
import { AddToRoomSelectRoom } from "./add-to-room.select-room";
import { AddToRoomSelectTemplate } from "./add-to-room.select-template";
import { AddToRoomConfirmation } from "./add-to-room.confirmation";
import { AddToRoomDialogSteps } from "./add-to-room.dialog.steps";

export function AddToRoomDialog() {
  const step = useAddToRoom((state) => state.step);

  const addToRoomOpen = useTemplatesUseCase((state) => state.addToRoom.open);
  const setAddToRoomOpen = useTemplatesUseCase(
    (state) => state.setAddToRoomOpen,
  );

  return (
    <Dialog
      open={addToRoomOpen}
      onOpenChange={(open) => setAddToRoomOpen(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none min-w-4/12 max-w-4/12 min-h-[calc(100dvh-500px)] max-h-[calc(100dvh-500px)]">
          <div className="w-full h-full flex flex-col gap-5">
            <DialogHeader>
              <div className="w-full flex gap-5 justify-between items-center">
                <DialogTitle className="font-inter text-2xl font-normal uppercase">
                  Add to Room
                </DialogTitle>
                <DialogClose asChild>
                  <button
                    className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                    onClick={() => {
                      setAddToRoomOpen(false);
                    }}
                  >
                    <X size={16} strokeWidth={1} />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            <AddToRoomDialogSteps />
            {step === "select-room" && <AddToRoomSelectRoom />}
            {step === "select-template" && <AddToRoomSelectTemplate />}
            {step === "confirm" && <AddToRoomConfirmation />}
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
