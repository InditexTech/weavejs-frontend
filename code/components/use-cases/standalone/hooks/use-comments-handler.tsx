// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getStandaloneThreads } from "@/api/standalone/get-standalone-threads";
import { postStandaloneThread } from "@/api/standalone/post-standalone-thread";
import { putStandaloneThread } from "@/api/standalone/put-standalone-thread";
import { useWeave } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WeaveElementInstance,
} from "@inditextech/weave-types";
import { toast } from "sonner";
import {
  WeaveCommentNode,
  WeaveCommentNodeOnCreateCommentEvent,
  WeaveCommentNodeOnDragEndEvent,
  WeaveCommentsRendererPlugin,
} from "@inditextech/weave-sdk";
import { ThreadEntity } from "../components/comment/types";
import { useStandaloneUseCase } from "../store/store";
import { useComment } from "./use-comment";

export const useCommentsHandler = () => {
  const [comments, setComments] = React.useState<ThreadEntity[]>([]);

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);

  const user = useStandaloneUseCase((state) => state.user);
  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const commentsStatus = useStandaloneUseCase((state) => state.comments.status);

  const { handleRefreshComments } = useComment({ node: null });

  const { data, error, isLoading } = useQuery({
    queryKey: ["standaloneComments", instanceId, managingImageId],
    queryFn: () => {
      if (!instanceId || !managingImageId) {
        return Promise.resolve({ items: [], total: 0 });
      }

      return getStandaloneThreads(
        instanceId,
        managingImageId,
        commentsStatus,
        true
      );
    },
    staleTime: 0,
    enabled:
      typeof instance !== "undefined" &&
      instanceId !== null &&
      managingImageId !== null,
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

      return (await postStandaloneThread({
        userId: user.name ?? "",
        userMetadata: user,
        instanceId: instanceId ?? "",
        imageId: managingImageId ?? "",
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
        commentHandler.setCommentModel(node, data.thread);
      }

      handleRefreshComments();
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

      return await putStandaloneThread({
        userId: user.name ?? "",
        threadId,
        instanceId: instanceId ?? "",
        imageId: managingImageId ?? "",
        x: node.x(),
        y: node.y(),
      });
    },
    onSuccess() {
      if (!instance) {
        return;
      }
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
