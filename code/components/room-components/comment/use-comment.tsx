// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getThreadAnswers } from "@/api/get-thread-answers";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { ThreadEntity } from "../hooks/types";
import { getThread } from "@/api/get-thread";
import { WeaveCommentNode } from "@inditextech/weave-sdk/client";

type UseCommentProps = {
  node: WeaveElementInstance;
};

export const useComment = ({ node }: Readonly<UseCommentProps>) => {
  const instance = useWeave((state) => state.instance);

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);

  const commentId: string | null = React.useMemo(() => {
    if (!instance) return null;

    const commentHandler =
      instance.getNodeHandler<WeaveCommentNode<ThreadEntity>>("comment");

    if (commentHandler) {
      return commentHandler.getCommentId(node);
    }

    return null;
  }, [instance, node]);

  const comment = useQuery({
    queryKey: ["comment", room ?? "", commentId],
    queryFn: () => {
      return getThread({
        roomId: room ?? "",
        threadId: commentId ?? "",
        userId: user?.name ?? "",
        clientId: clientId ?? "",
      });
    },
    enabled: typeof node !== "undefined",
  });

  const answers = useQuery({
    queryKey: [
      "comment-answers",
      room ?? "",
      node.getAttrs().commentModel.threadId,
    ],
    queryFn: () => {
      return getThreadAnswers(
        room ?? "",
        node.getAttrs().commentModel.threadId,
        false
      );
    },
    enabled: typeof node !== "undefined",
  });

  const queryClient = useQueryClient();

  const handleRefreshComment = React.useCallback(() => {
    const queryKeyComments = ["comment", room ?? "", commentId];
    queryClient.invalidateQueries({ queryKey: queryKeyComments });
  }, [queryClient, room, commentId]);

  const handleRefreshCommentAnswers = React.useCallback(() => {
    const queryKeyCommentAnswers = ["comment-answers", room ?? "", commentId];
    queryClient.invalidateQueries({ queryKey: queryKeyCommentAnswers });
  }, [queryClient, room, commentId]);

  return {
    commentId,
    comment,
    answers,
    handleRefreshComment,
    handleRefreshCommentAnswers,
  };
};
