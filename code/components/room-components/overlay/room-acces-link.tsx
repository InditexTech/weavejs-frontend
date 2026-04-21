// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localeData from "dayjs/plugin/localeData";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { Copy, LoaderCircle, X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useMutation } from "@tanstack/react-query";
import { useLoadRoomInfo } from "../hooks/use-load-room-info";
import { postRoomAccessLink } from "@/api/rooms/post-room-access-link";
import { Badge } from "@/components/ui/badge";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(relativeTime);
dayjs.extend(calendar);

export function RoomAccessLinkDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);

  const [generating, setGenerating] = React.useState<boolean>(false);
  const [generated, setGenerated] = React.useState<boolean>(false);
  const [, setError] = React.useState<boolean>(false);
  const [validForSeconds, setValidForSeconds] = React.useState<string>("86400");
  const [generatedData, setGeneratedData] = React.useState<{
    accessId: string;
    accessRoomId: string;
    accessCode: string;
    validUntilUTC: string;
  } | null>(null);

  const roomId = useCollaborationRoom((state) => state.rooms.roomId);
  const accessRoomVisible = useCollaborationRoom(
    (state) => state.rooms.access.visible,
  );
  const setRoomsAccessVisible = useCollaborationRoom(
    (state) => state.setRoomsAccessVisible,
  );

  React.useEffect(() => {
    if (accessRoomVisible) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
    }
  }, [accessRoomVisible]);

  const { data } = useLoadRoomInfo(roomId);

  const generateAccessLinkRoom = useMutation({
    mutationFn: async ({
      roomId,
      validForSeconds,
    }: {
      roomId: string;
      validForSeconds: number;
    }) => {
      setGenerating(true);
      return await postRoomAccessLink({ roomId, validForSeconds });
    },
    onSettled: () => {
      setGenerating(false);
    },
    onSuccess: (data) => {
      setGeneratedData({
        accessId: data.id,
        accessRoomId: data.roomId,
        accessCode: data.code,
        validUntilUTC: data.validUntilUTC,
      });
      setGenerated(true);
      setError(false);
    },
    onError() {
      setGenerated(true);
      setError(true);
    },
  });

  React.useEffect(() => {
    if (accessRoomVisible) {
      setGenerating(false);
      setGenerated(false);
      setError(false);
      setValidForSeconds("86400");
      setGeneratedData(null);
    }
  }, [accessRoomVisible]);

  const handleGenerateAccessLinkRoom = React.useCallback(() => {
    generateAccessLinkRoom.mutate({
      roomId: data?.room?.roomId ?? "",
      validForSeconds: parseInt(validForSeconds),
    });
  }, [data, validForSeconds, generateAccessLinkRoom]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!accessRoomVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleGenerateAccessLinkRoom();
      }
    },
    [accessRoomVisible, handleGenerateAccessLinkRoom],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const accessCode = React.useMemo(() => {
    return btoa(
      `${generatedData?.accessId ?? "-"} | ${generatedData?.accessRoomId ?? "-"} | ${generatedData?.accessCode ?? "-"}`,
    );
  }, [generatedData]);

  return (
    <Dialog
      open={accessRoomVisible}
      onOpenChange={(open) => setRoomsAccessVisible(open)}
    >
      <form>
        <DialogContent
          className="w-full rounded-none top-5 min-w-3/12 max-w-3/12 translate-y-0"
          onInteractOutside={(e) => {
            if (generating) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Room access link
              </DialogTitle>
              <DialogClose asChild>
                <button
                  disabled={generating}
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setRoomsAccessVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
          {generating && (
            <div className="w-full h-full flex flex-col justify-center items-center gap-3">
              <LoaderCircle
                strokeWidth={1}
                size={48}
                className="animate-spin"
              />
              <div className="flex flex-col justify-center items-center gap-1">
                <p className="font-light text-xl text-[#757575]">
                  GENERATING ROOM ACCESS LINK
                </p>
                <p className="font-light text-base">Please wait...</p>
              </div>
            </div>
          )}
          {!generating && generated && (
            <div className="grid grid-cols-2 gap-5">
              <Field className="col-span-2">
                <FieldLabel htmlFor="input-demo-api-key">
                  <span>Room to share</span>
                </FieldLabel>
                <span className="text-[#757575] text-base">
                  {data?.room?.name ?? "-"}
                </span>
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="input-demo-api-key">
                  <span>Access code</span>
                </FieldLabel>
                <div className="w-full flex gap-1 justify-start items-center">
                  <Badge
                    variant="outline"
                    className="max-w-[calc(100%-8px-20px)] font-mono text-sm truncate justify-start min-w-0"
                  >
                    {accessCode}
                  </Badge>
                  <button className="cursor-pointer hover:text-[#c9c9c9]">
                    <Copy
                      size={16}
                      strokeWidth={1}
                      className="ml-2 cursor-pointer"
                      onClick={async () => {
                        await navigator.clipboard.writeText(accessCode);
                      }}
                    />
                  </button>
                </div>
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="input-demo-api-key">
                  <span>Valid until</span>
                </FieldLabel>
                <span className="text-[#757575] text-base">
                  {dayjs(generatedData?.validUntilUTC).format(
                    "dddd, MMMM D, YYYY h:mm A",
                  )}
                </span>
              </Field>
            </div>
          )}
          {!generating && !generated && (
            <div className="grid grid-cols-2 gap-5">
              <Field className="col-span-2">
                <FieldLabel htmlFor="input-demo-api-key">
                  <span>Room to share</span>
                </FieldLabel>
                <span className="text-[#757575]">
                  {data?.room?.name ?? "-"}
                </span>
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="input-demo-api-key">
                  <span>Link valid for</span>
                </FieldLabel>
                <Select
                  value={validForSeconds}
                  onValueChange={setValidForSeconds}
                >
                  <SelectTrigger className="cursor-pointer font-inter text-sm rounded-none w-[200px] !h-[40px] !shadow-none">
                    <SelectValue placeholder="Amount" />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] !shadow-none"
                    align="end"
                  >
                    <SelectGroup>
                      <SelectItem
                        value="900"
                        className="cursor-pointer font-inter text-xs rounded-none"
                      >
                        15 minutes
                      </SelectItem>
                      <SelectItem
                        value="3600"
                        className="cursor-pointer font-inter text-xs rounded-none"
                      >
                        1 hour
                      </SelectItem>
                      <SelectItem
                        value="86400"
                        className="cursor-pointer font-inter text-xs rounded-none"
                      >
                        24 hours
                      </SelectItem>
                      <SelectItem
                        value="172800"
                        className="cursor-pointer font-inter text-xs rounded-none"
                      >
                        48 hours
                      </SelectItem>
                      <SelectItem
                        value="604800"
                        className="cursor-pointer font-inter text-xs rounded-none"
                      >
                        1 week
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Select the amount of time the access link and code will be
                  valid for. After that, the link will expire and a new one will
                  need to be generated.
                </FieldDescription>
              </Field>
            </div>
          )}
          <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
          <DialogFooter>
            {!generated && (
              <>
                <Button
                  type="button"
                  disabled={generating}
                  className="cursor-pointer font-inter rounded-none"
                  onClick={() => {
                    setRoomsAccessVisible(false);
                  }}
                  variant="secondary"
                >
                  CANCEL
                </Button>
                <Button
                  type="button"
                  disabled={generating}
                  className="cursor-pointer font-inter rounded-none"
                  onClick={handleGenerateAccessLinkRoom}
                >
                  GENERATE ACCESS LINK
                </Button>
              </>
            )}
            {generated && (
              <>
                <Button
                  type="button"
                  disabled={generating}
                  className="cursor-pointer font-inter rounded-none"
                  onClick={() => {
                    setRoomsAccessVisible(false);
                  }}
                  variant="secondary"
                >
                  CLOSE
                </Button>
                <Button
                  className="cursor-pointer rounded-none"
                  onClick={async () => {
                    const origin = window.location.origin;
                    await navigator.clipboard.writeText(
                      `${origin}/rooms/access-link?p=${accessCode}`,
                    );
                  }}
                >
                  COPY SHARE LINK TO CLIPBOARD
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
