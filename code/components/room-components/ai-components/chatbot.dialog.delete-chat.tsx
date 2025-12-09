// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { delChat } from "@/api/del-chat";
import { useIAChat } from "@/store/ia-chat";
import { useCollaborationRoom } from "@/store/store";

type ChatBotDialogDeleteChatProps = {
  threadId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const ChatBotDialogDeleteChat = ({
  threadId,
  open,
  setOpen,
}: ChatBotDialogDeleteChatProps) => {
  const [deleting, setDeleting] = React.useState<boolean>(false);

  const user = useCollaborationRoom((state) => state.user);
  const room = useCollaborationRoom((state) => state.room);

  const resourceId = useIAChat((state) => state.resourceId);
  const setAiView = useIAChat((state) => state.setView);

  const queryClient = useQueryClient();

  const mutateDeleteChat = useMutation({
    mutationFn: async ({
      threadId,
      resourceId,
    }: {
      threadId: string;
      resourceId: string;
    }) => {
      if (!room) throw new Error("No room available");

      setDeleting(true);

      return await delChat(room, threadId, resourceId);
    },
    onSettled() {
      setDeleting(false);
    },
    async onSuccess(_, { threadId }) {
      if (!user || !room) return;

      const actualChat = sessionStorage.getItem(
        `weave.js_${room}_${user.id}_ai_thread_id`
      );

      if (threadId === actualChat) {
        sessionStorage.removeItem(`weave.js_${room}_${user.id}_ai_thread_id`);
      }

      const queryKey = ["getChats", resourceId];
      await queryClient.invalidateQueries({ queryKey });

      sessionStorage.removeItem(`weave.js_${room}_${user.id}_ai_thread_id`);
      setOpen(false);
      setAiView("chats");

      toast.success("Chat deleted successfully");
    },
    onError() {
      toast.error("Error deleting the chat");
    },
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-full flex gap-5 justify-between items-center">
            <DialogTitle className="font-inter text-2xl font-normal uppercase">
              Delete Chat
            </DialogTitle>
          </div>
          <DialogDescription className="font-inter text-sm mt-5">
            Are you sure you want to delete this chat? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="w-full flex justify-end gap-1 items-center">
            <Button
              type="button"
              size="sm"
              variant="default"
              disabled={deleting}
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                setOpen(false);
              }}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleting}
              variant="destructive"
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                mutateDeleteChat.mutate({ threadId, resourceId });
              }}
            >
              {deleting ? "DELETING" : "DELETE"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
