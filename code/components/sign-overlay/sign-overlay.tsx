// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { LoaderCircle } from "lucide-react";

export const SignOverlay = () => {
  const signingIn = useCollaborationRoom((state) => state.signingIn);

  return (
    <>
      {signingIn && (
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/25 flex flex-col items-center justify-center z-[1000]">
          <div className="flex flex-col bg-white p-8 justify-center items-center gap-1">
            <LoaderCircle strokeWidth={1} size={48} className="animate-spin" />
            <div className="font-light text-xl uppercase mt-7">LOGGING IN</div>
            <div className="font-light text-base text-foreground-muted">
              please wait...
            </div>
          </div>
        </div>
      )}
    </>
  );
};
