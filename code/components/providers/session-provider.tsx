// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { Logo } from "../utils/logo";
import { Ban } from "lucide-react";

type SessionProviderProps = {
  children: React.ReactNode;
};

export const SessionProvider = ({
  children,
}: Readonly<SessionProviderProps>) => {
  const { isPending, error } = useGetSession();

  if (error) {
    return (
      <main className="relative w-full h-full grid grid-cols-[3fr_9fr] flex justify-center items-center relative">
        <div className="absolute top-8 left-8">
          <Logo kind="landscape" variant="no-text" />
        </div>
        <div className="flex flex-col gap-3 justify-center items-center col-span-2">
          <Ban size={48} strokeWidth={1} />
          <div className="flex flex-col justify-center items-center gap-1">
            <p className="font-light text-xl text-[#757575] uppercase">
              FAILED LOADING THE APPLICATION
            </p>
            <p className="font-light text-base">
              please contact support if the problem persists
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (isPending) {
    return null;
  }

  return children;
};
