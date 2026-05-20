// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";
import { useAddTemplateToRoom } from "@/store/add-template-to-room";

export function AddToRoomDialogSteps() {
  const step = useAddTemplateToRoom((state) => state.step);

  return (
    <div className="flex gap-3 justify-center items-center my-5">
      <div
        className={cn(
          "font-inter rounded-full bg-[#c9c9c9] text-black text-base w-[32px] h-[32px] flex justify-center items-center",
          {
            ["bg-black text-white"]: step === "select-template",
            ["bg-[#c9c9c9] text-black"]: step !== "select-template",
          },
        )}
      >
        1
      </div>
      <div
        className={cn("font-inter text-base", {
          ["text-black"]: step === "select-template",
          ["text-[#c9c9c9]"]: step !== "select-template",
        })}
      >
        TEMPLATE
      </div>
      <div className="w-[1px] h-[20px] bg-[#c9c9c9]"></div>
      <div
        className={cn(
          "font-inter rounded-full bg-[#c9c9c9] text-black text-base w-[32px] h-[32px] flex justify-center items-center",
          {
            ["bg-black text-white"]: step === "configuration",
            ["bg-[#c9c9c9] text-black"]: step !== "configuration",
          },
        )}
      >
        2
      </div>
      <div
        className={cn("font-inter text-base", {
          ["text-black"]: step === "configuration",
          ["text-[#c9c9c9]"]: step !== "configuration",
        })}
      >
        SETUP
      </div>
      <div className="w-[1px] h-[20px] bg-[#c9c9c9]"></div>
      <div
        className={cn(
          "font-inter rounded-full bg-[#c9c9c9] text-black text-base w-[32px] h-[32px] flex justify-center items-center",
          {
            ["bg-black text-white"]: step === "confirm",
            ["bg-[#c9c9c9] text-black"]: step !== "confirm",
          },
        )}
      >
        3
      </div>
      <div
        className={cn("font-inter text-base", {
          ["text-black"]: step === "confirm",
          ["text-[#c9c9c9]"]: step !== "confirm",
        })}
      >
        RESUME
      </div>
    </div>
  );
}
