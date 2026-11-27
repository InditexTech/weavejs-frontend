// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button } from "../ui/button";
import { Lineicons } from "@lineiconshq/react-lineicons";
import { GoogleOutlined, GithubOutlined } from "@lineiconshq/free-icons";
import { authClient } from "@/lib/auth.client";
import { cn } from "@/lib/utils";
import { useCollaborationRoom } from "@/store/store";
import { LegalConsentCheckbox } from "../legal/legal-consent-checkbox";
import { SessionLiveCanvas } from "./session.live-canvas";

type SessionLoginProps = {
  hideTitle?: boolean;
  showIntro?: boolean;
};

export const SessionLogin = ({
  hideTitle = false,
  showIntro = false,
}: Readonly<SessionLoginProps>) => {
  const setLoggingIn = useCollaborationRoom((state) => state.setSigningIn);
  const [accepted, setAccepted] = React.useState(false);

  const bold = !hideTitle;
  const buttonClass = cn("cursor-pointer font-inter font-light rounded-none", {
    ["h-10 w-full justify-start gap-3 px-4 text-sm tracking-normal border-black/10 bg-white text-neutral-800 shadow-none transition-colors duration-150 ease-out hover:bg-neutral-50 hover:border-black/30 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"]:
      bold,
  });

  return (
    <div
      className={cn(
        "max-w-full lg:max-w-[500px] w-[calc(100dvw-24px)] h-full lg:h-auto flex flex-col bg-background",
        {
          ["p-8 gap-6 items-stretch justify-center"]: bold,
          ["p-0 gap-8 items-center justify-center"]: !bold,
        },
      )}
    >
      {bold && showIntro && <SessionLiveCanvas />}
      {bold && (
        <div className="flex flex-col gap-3">
          <h1 className="font-inter font-light text-neutral-900 text-3xl leading-[1.15] tracking-tight">
            Welcome to
            <br />
            <span className="font-normal">Weave.js</span>
          </h1>
          {showIntro && (
            <p className="text-sm text-neutral-700 leading-relaxed">
              Weave.js is an open-source framework for building collaborative,
              real-time visual canvases on the web. Draw, design and build
              together, with AI assistance built in.
            </p>
          )}
          <p className="text-sm text-[#757575]">
            Sign in and your first room is a few seconds away.
          </p>
        </div>
      )}
      <LegalConsentCheckbox checked={accepted} onCheckedChange={setAccepted} />
      <div className={cn("flex flex-col gap-2", { ["w-full"]: bold })}>
        <Button
          variant="outline"
          disabled={!accepted}
          className={buttonClass}
          onClick={async () => {
            if (!accepted) return;
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
            className="!w-[20px] !h-[20px]"
          />
          Sign in with Google
        </Button>
        <Button
          variant="outline"
          disabled={!accepted}
          className={buttonClass}
          onClick={async () => {
            if (!accepted) return;
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
            className="!w-[20px] !h-[20px]"
          />
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
};
