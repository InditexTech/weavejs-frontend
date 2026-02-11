// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useAddToRoom } from "../../store/add-to-room";
import { cn } from "@/lib/utils";

export function AddToRoomDialogSteps() {
  const step = useAddToRoom((state) => state.step);

  return (
    <div className="flex gap-3 justify-center items-center my-5">
      <div
        className={cn(
          "font-inter rounded-full bg-black text-white text-xl w-[32px] h-[32px] flex justify-center items-center",
          {
            ["bg-black text-white"]: step === "select-room",
            ["bg-[#c9c9c9] text-black"]: step !== "select-room",
          },
        )}
      >
        1
      </div>
      <div
        className={cn("font-inter text-xl", {
          ["text-black"]: step === "select-room",
          ["text-[#c9c9c9]"]: step !== "select-room",
        })}
      >
        ROOM
      </div>
      <div className="w-[1px] h-[20px] bg-[#c9c9c9]"></div>
      <div
        className={cn(
          "font-inter rounded-full bg-[#c9c9c9] text-black text-xl w-[32px] h-[32px] flex justify-center items-center",
          {
            ["bg-black text-white"]: step === "select-template",
            ["bg-[#c9c9c9] text-black"]: step !== "select-template",
          },
        )}
      >
        2
      </div>
      <div
        className={cn("font-inter text-xl", {
          ["text-black"]: step === "select-template",
          ["text-[#c9c9c9]"]: step !== "select-template",
        })}
      >
        SELECT TEMPLATE
      </div>
      <div className="w-[1px] h-[20px] bg-[#c9c9c9]"></div>
      <div
        className={cn(
          "font-inter rounded-full bg-[#c9c9c9] text-black text-xl w-[32px] h-[32px] flex justify-center items-center",
          {
            ["bg-black text-white"]: step === "confirm",
            ["bg-[#c9c9c9] text-black"]: step !== "confirm",
          },
        )}
      >
        3
      </div>
      <div
        className={cn("font-inter text-xl", {
          ["text-black"]: step === "confirm",
          ["text-[#c9c9c9]"]: step !== "confirm",
        })}
      >
        CONFIRM
      </div>
    </div>
  );
}
