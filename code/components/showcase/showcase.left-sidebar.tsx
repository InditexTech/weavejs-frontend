// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Logo } from "@/components/utils/logo";
import {
  Avatar as AvatarUI,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { Eye, EyeOff, ExternalLink, LogOut } from "lucide-react";
import { DOCUMENTATION_URL, GITHUB_URL } from "@/lib/constants";
import { Divider } from "../room-components/overlay/divider";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { authClient } from "@/lib/auth.client";
import { useCollaborationRoom } from "@/store/store";
import packageJson from "@/../package.json";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Badge } from "../ui/badge";

export const ShowcaseLeftSidebar = () => {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });

  const isStandalone = location.pathname.startsWith("/use-cases/standalone");
  const isTemplates = location.pathname.startsWith("/use-cases/templates");
  const isShowcase = React.useMemo(() => {
    if (isStandalone || isTemplates) {
      return false;
    }
    return true;
  }, [isStandalone, isTemplates]);

  const dependenciesVisible = useCollaborationRoom(
    (state) => state.dependencies.visible,
  );
  const setDependenciesVisible = useCollaborationRoom(
    (state) => state.setDependenciesVisible,
  );

  const { session } = useGetSession();

  return (
    <div className="w-full h-full flex flex-col border-r border-r-[0.5px] border-[#c9c9c9] p-8 justify-between items-start">
      <div className="w-full flex flex-col gap-2 justify-start items-between">
        <Logo kind="landscape" variant="no-text" />
        <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
          {isShowcase && <span>SHOWCASE</span>}
          {isStandalone && <span>STANDALONE</span>}
          {isTemplates && <span>TEMPLATES</span>}
        </h1>
        <div className="w-full mt-5 flex flex-col justify-start items-start">
          <Divider className="h-[1px] w-full mb-6" />
          <Button
            variant="link"
            disabled={isShowcase}
            className="cursor-pointer font-light text-2xl !px-0 !py-0 !h-auto"
            onClick={async () => {
              navigate({ to: `/` });
            }}
          >
            SHOWCASE
          </Button>
          <div className="font-light text-sm !px-0 !py-0 !h-auto mt-5 text-muted-foreground">
            USE CASES
          </div>
          <Button
            variant="link"
            disabled={isStandalone}
            className="cursor-pointer font-light text-2xl !px-0 !py-0 !h-auto"
            onClick={async () => {
              navigate({ to: `/use-cases/standalone` });
            }}
          >
            STANDALONE
          </Button>
          <Button
            variant="link"
            disabled={isTemplates}
            className="cursor-pointer font-light text-2xl !px-0 !py-0 !h-auto"
            onClick={async () => {
              navigate({ to: `/use-cases/templates` });
            }}
          >
            TEMPLATES
          </Button>
        </div>
      </div>
      <div className="w-full flex flex-col gap-3 justify-start items-start">
        {session && session.user && (
          <>
            <div className="text-sm font-light flex gap-2 justify-start items-center">
              <AvatarUI className="cursor-pointer w-[40px] h-[40px] bg-muted font-light !text-xs leading-[18px] border-[0.5px] border-[#c9c9c9]">
                <AvatarImage
                  src={session.user.image ?? ""}
                  alt={session.user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-transparent uppercase">
                  {session.user.name}
                </AvatarFallback>
              </AvatarUI>
              <div className="flex flex-col gap-0 justify-start items-start font-light text-base">
                <span>{session.user.name}</span>
                <b className="text-sm">{session.user.email}</b>
              </div>
            </div>
            <Divider className="h-[1px] w-full" />
            <Button
              variant="link"
              className="cursor-pointer font-inter font-light !px-0 !py-0 !h-auto"
              onClick={async () => {
                await authClient.signOut();
              }}
            >
              <LogOut strokeWidth={1} /> SIGN OUT
            </Button>
            <Divider className="h-[1px] w-full" />
          </>
        )}
        <Button
          variant="link"
          onClick={() => {
            window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
          }}
          className="cursor-pointer font-inter font-light !px-0 !py-0 !h-auto"
        >
          <ExternalLink strokeWidth={1} /> GITHUB
        </Button>
        <Button
          variant="link"
          onClick={() => {
            window.open(DOCUMENTATION_URL, "_blank", "noopener,noreferrer");
          }}
          className="cursor-pointer font-inter font-light !px-0 !py-0 !h-auto"
        >
          <ExternalLink strokeWidth={1} /> DOCUMENTATION
        </Button>
        <Button
          variant="link"
          onClick={() => {
            setDependenciesVisible(!dependenciesVisible);
          }}
          className="cursor-pointer font-inter font-light !px-0 !py-0 !h-auto"
        >
          {!dependenciesVisible ? (
            <Eye strokeWidth={1} />
          ) : (
            <EyeOff strokeWidth={1} />
          )}{" "}
          DEPENDENCIES
        </Button>
        <Divider className="h-[1px] w-full my-3" />
        <div className="w-full flex justify-start items-center gap-1 text-muted-foreground">
          <Badge variant="outline" className="text-xs font-mono">
            v{packageJson.version}
          </Badge>
        </div>
      </div>
    </div>
  );
};
