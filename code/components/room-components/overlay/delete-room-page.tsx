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
} from "@/components/ui/dialog";
import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { useMutation } from "@tanstack/react-query";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useLoadPageInfo } from "../hooks/use-load-page-info";
import { delPage } from "@/api/pages/del-page";

export function DeleteRoomPageDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);
  const loadingRef = React.useRef<string | number | null>(null);

  const [archiving, setArchiving] = React.useState<boolean>(false);

  const roomId = useCollaborationRoom((state) => state.rooms.roomId);
  const pageId = useCollaborationRoom((state) => state.rooms.pageId);
  const deleteRoomPageVisible = useCollaborationRoom(
    (state) => state.rooms.deletePage.visible,
  );
  const setRoomsPageDeleteVisible = useCollaborationRoom(
    (state) => state.setRoomsPageDeleteVisible,
  );

  React.useEffect(() => {
    if (deleteRoomPageVisible) {
      setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
    }
  }, [deleteRoomPageVisible]);

  const { data: pageInfo } = useLoadPageInfo(roomId ?? "", pageId ?? "");

  const archivePage = useMutation({
    mutationFn: async ({
      roomId,
      pageId,
    }: {
      roomId: string;
      pageId: string;
    }) => {
      setArchiving(true);
      setRoomsPageDeleteVisible(false);
      loadingRef.current = toast.loading(`Archiving the page, please wait...`);

      return await delPage(roomId, pageId);
    },
    onSettled: () => {
      if (loadingRef.current) {
        toast.dismiss(loadingRef.current);
      }
      setArchiving(false);
    },
    onSuccess: () => {
      toast.success(`Page archived successfully`);
    },
    onError() {
      toast.error(`Failed to archive the page. Please check and try again`);
    },
  });

  const handleArchivePage = React.useCallback(() => {
    archivePage.mutate({
      roomId: roomId ?? "",
      pageId: pageId ?? "",
    });
  }, [roomId, pageId, archivePage]);

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (!deleteRoomPageVisible) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleArchivePage();
      }
    },
    [deleteRoomPageVisible, handleArchivePage],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={deleteRoomPageVisible}
      onOpenChange={(open) => setRoomsPageDeleteVisible(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-3/12 max-w-3/12 translate-y-0">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Archive page
              </DialogTitle>
              <DialogClose>
                <div
                  role="button"
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setRoomsPageDeleteVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </div>
              </DialogClose>
            </div>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to archive the page:{" "}
            <b>{pageInfo?.name ?? "loading"}</b>?
          </DialogDescription>
          <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-2"></div>
          <DialogFooter>
            <Button
              type="button"
              disabled={archiving}
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setRoomsPageDeleteVisible(false);
              }}
              variant="secondary"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              disabled={archiving}
              variant="destructive"
              className="cursor-pointer font-inter rounded-none"
              onClick={handleArchivePage}
            >
              ARCHIVE
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
