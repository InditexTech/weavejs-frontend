// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { Logo } from "@/components/utils/logo";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { getError } from "./errors";
import { Divider } from "../room-components/overlay/divider";

export const Error = () => {
  const navigate = useNavigate();

  const searchParams: { error: string | undefined } = useSearch({
    strict: false,
  });

  const errorCode = searchParams.error as string | undefined;

  const { description, action, href } = getError(errorCode || "");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent relative gap-5">
      <div className="max-w-lg flex flex-col items-center justify-center w-full shadow-none">
        <div className="w-full flex flex-col gap-2 justify-center items-center">
          <Logo kind="landscape" variant="no-text" />
          <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
            SHOWCASE
          </h1>
        </div>
        <div className="w-full flex flex-col justify-center items-center text-black gap-8 mt-8">
          <Bug size={48} strokeWidth={1} />
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <div className="text-center text-base text-[#757575]">
              <p className="uppercase">Oops an error has occurred</p>
            </div>
            <div className="text-center text-base text-[#757575]">
              <p>{description}</p>
            </div>
          </div>
          <Divider className="h-[1px] w-full" />
          <Button
            className="cursor-pointer font-inter font-light rounded-none uppercase"
            onClick={async () => {
              navigate({ to: href });
            }}
          >
            {action}
          </Button>
        </div>
      </div>
    </div>
  );
};
