// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { AddToRoomSelectTemplate } from "./add-to-room.select-template";
import { AddToRoomConfirmation } from "./add-to-room.confirmation";
import { AddToRoomDialogSteps } from "./add-to-room.dialog.steps";
import { useAddTemplateToRoom } from "@/store/add-template-to-room";
import { AddToRoomConfiguration } from "./add-to-room.configuration";

export function AddToRoomDialog() {
  const step = useAddTemplateToRoom((state) => state.step);
  const visible = useAddTemplateToRoom((state) => state.visible);
  const setVisible = useAddTemplateToRoom((state) => state.setVisible);

  return (
    <Dialog open={visible} onOpenChange={(open) => setVisible(open)}>
      <form>
        <DialogContent className="w-full rounded-none min-w-4/12 max-w-4/12 min-h-[calc(100dvh-48px)] max-h-[calc(100dvh-48px)]">
          <div className="w-full h-full flex flex-col gap-5">
            <DialogHeader>
              <div className="w-full flex gap-5 justify-between items-center">
                <DialogTitle className="font-inter text-2xl font-normal uppercase">
                  Add Images from Template
                </DialogTitle>
                <DialogClose asChild>
                  <button
                    className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                    onClick={() => {
                      setVisible(false);
                    }}
                  >
                    <X size={16} strokeWidth={1} />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            <AddToRoomDialogSteps />
            {step === "select-template" && <AddToRoomSelectTemplate />}
            {step === "configuration" && <AddToRoomConfiguration />}
            {step === "confirm" && <AddToRoomConfirmation />}
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
