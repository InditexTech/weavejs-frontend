// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useMutation } from "@tanstack/react-query";
import { putPage } from "@/api/pages/put-page";
import { useLoadPageInfo } from "../hooks/use-load-page-info";

export function EditRoomPageDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const loadingRef = React.useRef<string | number | null>(null);

  const [editing, setEditing] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>("");

  const roomId = useCollaborationRoom((state) => state.rooms.roomId);
  const pageId = useCollaborationRoom((state) => state.rooms.pageId);
  const editPageRoomVisible = useCollaborationRoom(
    (state) => state.rooms.editPage.visible,
  );
  const setRoomsPageEditVisible = useCollaborationRoom(
    (state) => state.setRoomsPageEditVisible,
  );

  React.useEffect(() => {
    if (editPageRoomVisible) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
    }
  }, [editPageRoomVisible]);

  const { data: pageInfo } = useLoadPageInfo(roomId ?? "", pageId ?? "");

  const editRoomPage = useMutation({
    mutationFn: async (params: {
      roomId: string;
      pageId: string;
      name: string;
    }) => {
      setEditing(true);
      setRoomsPageEditVisible(false);
      loadingRef.current = toast.loading("Editing the page, please wait...");

      return await putPage(params.roomId, params.pageId, {
        name: params.name,
      });
    },
    onSettled: () => {
      if (loadingRef.current) {
        toast.dismiss(loadingRef.current);
      }
      setEditing(false);
    },
    onSuccess: () => {
      toast.success(`Page edited successfully`);
    },
    onError() {
      toast.error(`Failed to edit the page. Please check and try again`);
    },
  });

  React.useEffect(() => {
    if (pageInfo?.name) {
      setName(pageInfo?.name);
    }
  }, [pageInfo]);

  const handleEditRoomPage = React.useCallback(() => {
    editRoomPage.mutate({
      roomId: roomId ?? "",
      pageId: pageId ?? "",
      name,
    });
  }, [roomId, pageId, name, editRoomPage]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!editPageRoomVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleEditRoomPage();
      }
    },
    [editPageRoomVisible, handleEditRoomPage],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={editPageRoomVisible}
      onOpenChange={(open) => setRoomsPageEditVisible(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-3/12 max-w-3/12 translate-y-0">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Edit page
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setRoomsPageEditVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
          <DialogDescription>
            Edit the page metadata, which is composed of the room name.
          </DialogDescription>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <div className="grid grid-cols-2 gap-5">
            <Field className="col-span-2">
              <FieldLabel
                htmlFor="input-demo-api-key"
                className="!justify-between"
              >
                <span>Page name</span>
                <span className="text-sm text-muted-foreground">
                  [{name.length}/120]
                </span>
              </FieldLabel>
              <Input
                ref={nameRef}
                id="room-name"
                type="text"
                maxLength={120}
                className="!rounded-none"
                placeholder="My room name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldDescription>
                The name can have a maximum of 120 characters.
              </FieldDescription>
            </Field>
          </div>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <DialogFooter>
            <Button
              type="button"
              disabled={editing}
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setRoomsPageEditVisible(false);
              }}
              variant="secondary"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              disabled={editing}
              className="cursor-pointer font-inter rounded-none"
              onClick={handleEditRoomPage}
            >
              EDIT
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
