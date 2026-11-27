// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth.client";

export type ShowcaseUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

const getUserHue = (id: string) => {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash;
};

const getInitials = (name?: string | null) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`;
};

export const copyUserId = async (userId: string) => {
  try {
    await navigator.clipboard.writeText(userId);
    toast.success("User ID copied to clipboard");
  } catch {
    toast.error("Could not copy the user ID");
  }
};

const UserSummary = ({ user }: Readonly<{ user: ShowcaseUser }>) => {
  const hue = getUserHue(user.id);

  return (
    <>
      <Avatar
        className="size-10 rounded-lg border-[0.5px] border-[#c9c9c9]"
        style={{ backgroundColor: `hsl(${hue} 70% 92%)` }}
      >
        <AvatarImage
          src={user.image ?? ""}
          alt=""
          referrerPolicy="no-referrer"
        />
        <AvatarFallback
          className="rounded-lg bg-transparent font-light uppercase"
          style={{ color: `hsl(${hue} 45% 30%)` }}
        >
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span
          className="truncate text-xs text-muted-foreground"
          title={user.email}
        >
          {user.email}
        </span>
      </div>
    </>
  );
};

type ShowcaseUserMenuProps = {
  user: ShowcaseUser;
  showCopyUserId?: boolean;
};

export const ShowcaseUserMenu = ({
  user,
  showCopyUserId = false,
}: Readonly<ShowcaseUserMenuProps>) => {
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = React.useCallback(async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } catch {
      toast.error("Could not sign you out. Try again.");
      setSigningOut(false);
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="-mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-2 rounded-lg p-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
        >
          <UserSummary user={user} />
          <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg font-inter"
        side="right"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserSummary user={user} />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showCopyUserId && (
          <>
            <DropdownMenuItem
              className="cursor-pointer font-light uppercase"
              onSelect={() => {
                void copyUserId(user.id);
              }}
            >
              COPY USER ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer font-light uppercase"
          disabled={signingOut}
          onSelect={() => {
            void handleSignOut();
          }}
        >
          {signingOut ? "SIGNING OUT…" : "SIGN OUT"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
