// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Lineicons } from "@lineiconshq/react-lineicons";
import { GoogleOutlined, GithubOutlined } from "@lineiconshq/free-icons";
import { ShowcaseLeftSidebar } from "../showcase/showcase.left-sidebar";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { Divider } from "../room-components/overlay/divider";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth.client";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ShowcaseDependencies } from "../showcase/showcase.dependencies";
import { Ban, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { putRoomAccessLink } from "@/api/rooms/put-room-access-link";
import { Badge } from "../ui/badge";

export const RoomAccessLink = () => {
  const navigate = useNavigate();

  const { session, isPending, error: sessionError } = useGetSession();

  const search = useRouterState({
    select: (s) => s.location.search,
  });

  const accessPayload = React.useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("p");
  }, [search]);

  const tokens = React.useMemo(() => {
    if (!accessPayload) {
      return null;
    }

    const payload = atob(accessPayload);
    const tokens = payload.split(" | ");
    return {
      accessId: tokens[0],
      accessRoomId: tokens[1],
      accessCode: tokens[2],
    };
  }, [accessPayload]);

  const processingAccess = useMutation({
    mutationFn: async ({
      accessId,
      accessCode,
    }: {
      accessId: string;
      accessCode: string;
    }) => {
      return await putRoomAccessLink(accessId, accessCode);
    },
    onSuccess: (data) => {
      navigate({ to: `/rooms/${data.roomId}` });
    },
  });

  React.useEffect(() => {
    if (!tokens) {
      return;
    }

    if (!session) {
      return;
    }

    if (!processingAccess.isIdle) {
      return;
    }

    processingAccess.mutate({
      accessId: tokens.accessId,
      accessCode: tokens.accessCode,
    });
  }, [tokens, session, processingAccess]);

  if (sessionError) {
    return <div>Error: {sessionError.message}</div>;
  }

  if (isPending) {
    return <div>loading...</div>;
  }

  return (
    <>
      <main className="w-full h-full grid grid-cols-[4fr_8fr] xl:grid-cols-[3fr_9fr] flex justify-center items-center relative">
        <ShowcaseLeftSidebar />
        <div className="w-full h-dvh flex flex-col items-center justify-center">
          <div className="max-w-lg w-full h-full lg:h-auto flex flex-col gap-8 items-center justify-center bg-background">
            <div className="w-full flex flex-col justify-center items-center gap-8 text-xl">
              {processingAccess.isPending && (
                <>
                  <div className="flex flex-col justify-center items-center gap-3">
                    <Shield size={48} strokeWidth={1} />
                    <div className="flex flex-col justify-center items-center gap-1">
                      <p className="font-light text-xl text-[#757575]">
                        PROCESSING ROOM ACCESS
                      </p>
                      <p className="font-light text-base">Please wait...</p>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-2 justify-center items-center">
                    <div className="text-center text-base text-[#757575]">
                      <p>ROOM ID</p>
                    </div>
                    <Badge
                      className="ml-2 text-base max-w-lg rounded-sm overflow-hidden text-ellipsis whitespace-nowrap"
                      variant="outline"
                    >
                      {tokens?.accessRoomId}
                    </Badge>
                  </div>
                </>
              )}
              {!processingAccess.isError && processingAccess.isSuccess && (
                <div className="flex flex-col justify-center items-center gap-3">
                  <Shield size={48} strokeWidth={1} />
                  <div className="flex flex-col justify-center items-center gap-1">
                    <p className="font-light text-xl text-[#757575] uppercase">
                      Permission granted!
                    </p>
                    <p className="font-light text-base">
                      Redirecting to the room...
                    </p>
                  </div>
                </div>
              )}
              {processingAccess.isError && processingAccess.error && (
                <>
                  <div className="flex flex-col justify-center items-center gap-3">
                    <Ban size={48} strokeWidth={1} />
                    <p className="font-light text-xl text-[#757575] uppercase">
                      {processingAccess.error.message}
                    </p>
                  </div>
                  <div className="w-full flex flex-col gap-2 justify-center items-center">
                    <div className="text-center text-base text-[#757575]">
                      <p>ROOM ID</p>
                    </div>
                    <Badge
                      className="ml-2 text-base max-w-lg rounded-sm overflow-hidden text-ellipsis whitespace-nowrap"
                      variant="outline"
                    >
                      {tokens?.accessRoomId}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => processingAccess.reset()}
                    className="cursor-pointer rounded-none"
                  >
                    TRY AGAIN
                  </Button>
                </>
              )}
              {!session && (
                <p className="text-lg">
                  To access the room, sign in with one of our available social
                  logins.
                </p>
              )}
            </div>
            {!session && (
              <>
                <Divider className="h-[1px] w-full" />
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    className="cursor-pointer font-inter font-light rounded-none"
                    onClick={async () => {
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
              </>
            )}
          </div>
        </div>
        <ShowcaseDependencies />
      </main>
    </>
  );
};
