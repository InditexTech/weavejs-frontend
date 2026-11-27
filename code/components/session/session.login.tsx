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
import { SessionHeroDemo } from "./session.hero-demo";
import { SessionHeroFrame } from "./session.hero-frame";

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
    ["h-10 w-[65%] min-w-[16rem] justify-start gap-3 px-4 text-sm uppercase tracking-wider border-black/10 bg-white text-neutral-800 shadow-none transition-colors duration-150 ease-out hover:bg-neutral-50 hover:border-black/30 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"]:
      bold,
  });
  const iconClass = "!w-[20px] !h-[20px]";

  return (
    <div
      className={cn("flex flex-col bg-background", {
        // Fluid, up to 720px. The demo takes all of it and the text 60% of
        // it, centered; both follow --demo-w, which also shrinks them on a
        // short viewport so the whole sign-in fits without scrolling.
        ["w-full max-w-[720px] py-6 gap-6 items-center justify-center"]: bold,
        ["max-w-full lg:max-w-[500px] w-[calc(100dvw-24px)] h-full lg:h-auto p-0 gap-8 items-center justify-center"]:
          !bold,
      })}
      style={
        bold
          ? ({
              "--demo-w":
                "min(100%, max(20rem, calc((100dvh - 34rem) * 16 / 9)))",
            } as React.CSSProperties)
          : undefined
      }
    >
      {bold && (
        <div className="@container flex w-[calc(var(--demo-w)*0.6)] min-w-[17rem] flex-col gap-3">
          <h1 className="font-inter font-light text-neutral-900 text-[clamp(1.375rem,6.4cqw,2.25rem)] leading-[1.15] tracking-tight">
            Welcome to
            <br />
            <span className="font-normal">Weave.js</span>
          </h1>
          {showIntro && (
            <p className="text-[clamp(0.8125rem,3.3cqw,0.9375rem)] text-neutral-700 leading-relaxed text-pretty">
              Weave.js is an open-source framework for building collaborative,
              real-time visual canvases on the web. Draw, design and build
              together.
            </p>
          )}
        </div>
      )}
      {bold && showIntro && (
        <div className="mb-5 w-[var(--demo-w)] [@media(max-height:40rem)]:hidden">
          <SessionHeroFrame>
            <SessionHeroDemo />
          </SessionHeroFrame>
        </div>
      )}
      <div
        className={cn({
          ["@container flex w-[calc(var(--demo-w)*0.6)] min-w-[17rem] flex-col gap-5"]:
            bold,
          ["contents"]: !bold,
        })}
      >
        {bold && (
          <p className="text-[clamp(0.75rem,3cqw,0.875rem)] text-[#757575]">
            Sign in and your first room is a few seconds away.
          </p>
        )}
        <LegalConsentCheckbox
          checked={accepted}
          onCheckedChange={setAccepted}
          className={cn({ ["w-full max-w-none text-xs"]: bold })}
        />
        <div className="flex flex-col items-center gap-2">
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
              className={iconClass}
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
              className={iconClass}
            />
            Sign in with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};
