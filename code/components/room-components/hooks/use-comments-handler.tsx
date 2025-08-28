// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import { ThreadEntity } from "./types";
import { getThreads } from "@/api/get-threads";
import { postThread } from "@/api/post-thread";
import { useWeave } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WeaveElementInstance,
} from "@inditextech/weave-types";
import { toast } from "sonner";
import { eventBus } from "@/components/utils/events-bus";
import { putThread } from "@/api/put-thread";
import {
  WeaveCommentNode,
  WeaveCommentNodeOnCreateCommentEvent,
  WeaveCommentNodeOnDragEndEvent,
  WeaveCommentsRendererPlugin,
} from "@inditextech/weave-sdk";

export const useCommentsHandler = () => {
  const [comments, setComments] = React.useState<ThreadEntity[]>([]);

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const commentsStatus = useCollaborationRoom((state) => state.comments.status);

  const { data, error, isLoading } = useQuery({
    queryKey: ["comments", room ?? ""],
    queryFn: () => {
      return getThreads(room ?? "", commentsStatus, true);
    },
    enabled: typeof instance !== "undefined",
  });

  const mutateCreateThread = useMutation({
    mutationFn: async ({
      position,
      content,
    }: {
      node: WeaveElementInstance;
      position: Konva.Vector2d;
      content: string;
    }) => {
      if (!user) {
        return { thread: undefined, answers: [], total: 0 };
      }

      return (await postThread({
        userId: user.name ?? "",
        userMetadata: user,
        clientId: clientId ?? "",
        roomId: room ?? "",
        position,
        content,
      })) as { thread: ThreadEntity; answers: []; total: number };
    },
    onSuccess(data, { node }) {
      if (!instance) {
        return;
      }

      const commentHandler =
        instance.getNodeHandler<WeaveCommentNode<ThreadEntity>>("comment");

      if (commentHandler && data.thread) {
        commentHandler.afterCreatePersist(node, data.thread);

        eventBus.emit("onCommentsChanged");
      }
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to create thread");
    },
  });

  const mutateDragThread = useMutation({
    mutationFn: async ({
      threadId,
      node,
    }: {
      node: WeaveElementInstance;
      threadId: string;
    }) => {
      if (!user) {
        return { x: undefined, y: undefined };
      }

      return await putThread({
        userId: user.name ?? "",
        clientId: clientId ?? "",
        threadId,
        roomId: room ?? "",
        x: node.x(),
        y: node.y(),
      });
    },
    onSuccess() {
      if (!instance) {
        return;
      }

      eventBus.emit("onCommentsChanged");
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to save thread drag");
    },
  });

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded) {
      const commentsRendererPlugin =
        instance.getPlugin<WeaveCommentsRendererPlugin<ThreadEntity>>(
          "commentsRenderer"
        );
      commentsRendererPlugin?.setComments(comments);
      commentsRendererPlugin?.render();
    }
  }, [instance, status, roomLoaded, comments]);

  React.useEffect(() => {
    if (data) {
      setComments(data.items);
    }
  }, [data]);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const createThreadHandler = function ({
      node,
      position,
      content,
    }: WeaveCommentNodeOnCreateCommentEvent) {
      mutateCreateThread.mutate({ node, position, content });
    };

    const moveThreadHandler = function ({
      node,
    }: WeaveCommentNodeOnDragEndEvent) {
      const threadId = node.getAttrs()?.commentModel?.threadId;
      if (threadId) {
        mutateDragThread.mutate({ node, threadId });
      }
    };

    instance.addEventListener<WeaveCommentNodeOnCreateCommentEvent>(
      "onCommentCreate",
      createThreadHandler
    );

    instance.addEventListener<WeaveCommentNodeOnDragEndEvent>(
      "onCommentDragEnd",
      moveThreadHandler
    );

    return () => {
      instance.removeEventListener("onCommentCreate", createThreadHandler);
      instance.removeEventListener("onCommentDragEnd", moveThreadHandler);
    };
  }, [instance, mutateCreateThread, mutateDragThread]);

  return { comments, error, isLoading };
};
