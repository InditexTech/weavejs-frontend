// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Divider } from "../room-components/overlay/divider";
import { Button } from "../ui/button";
import { Lineicons } from "@lineiconshq/react-lineicons";
import { GoogleOutlined, GithubOutlined } from "@lineiconshq/free-icons";
import { authClient } from "@/lib/auth.client";
import { cn } from "@/lib/utils";
import { useCollaborationRoom } from "@/store/store";

type SessionLoginProps = {
  hideTitle?: boolean;
};

export const SessionLogin = ({
  hideTitle = false,
}: Readonly<SessionLoginProps>) => {
  const setLoggingIn = useCollaborationRoom((state) => state.setSigningIn);

  return (
    <div
      className={cn(
        "max-w-full lg:max-w-[500px] w-[calc(100dvw-24px)] h-full lg:h-auto flex flex-col gap-8 items-center justify-center bg-background",
        {
          ["p-8"]: !hideTitle,
          ["p-0"]: hideTitle,
        },
      )}
    >
      {!hideTitle && (
        <>
          <div className="text-center text-xl text-[#757575]">
            <p className="text-2xl">Welcome to Weave.js</p>
            <p className="text-lg">
              To get started, sign in with one of our social logins
            </p>
          </div>
          <Divider className="h-[0.5px] w-full" />
        </>
      )}
      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          className="cursor-pointer font-inter font-light rounded-none"
          onClick={async () => {
            setLoggingIn(true);
            await authClient.signIn.social({
              provider: "google",
              callbackURL: window.location.href,
            });
          }}
        >
          <Lineicons
            icon={GoogleOutlined}
            strokeWidth={1}
            className="!w-[32px] !h-[32px]"
          />
          CONTINUE WITH GOOGLE
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer font-inter font-light rounded-none"
          onClick={async () => {
            setLoggingIn(true);
            await authClient.signIn.social({
              provider: "github",
              callbackURL: window.location.href,
            });
          }}
        >
          <Lineicons
            icon={GithubOutlined}
            strokeWidth={1}
            className="!w-[32px] !h-[32px]"
          />
          CONTINUE WITH GITHUB
        </Button>
      </div>
    </div>
  );
};
