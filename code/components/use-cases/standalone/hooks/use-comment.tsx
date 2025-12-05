// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getStandaloneThreadAnswers } from "@/api/standalone/get-standalone-thread-answers";
import { useWeave } from "@inditextech/weave-react";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { getStandaloneThread } from "@/api/standalone/get-standalone-thread";
import { WeaveCommentNode } from "@inditextech/weave-sdk";
import { ThreadEntity } from "../components/comment/types";
import { useStandaloneUseCase } from "../store/store";

type UseCommentProps = {
  node: WeaveElementInstance | null;
};

export const useComment = ({ node }: Readonly<UseCommentProps>) => {
  const instance = useWeave((state) => state.instance);

  const user = useStandaloneUseCase((state) => state.user);
  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );

  const commentId: string | null = React.useMemo(() => {
    if (!instance) return null;

    if (!node) return null;

    const commentHandler =
      instance.getNodeHandler<WeaveCommentNode<ThreadEntity>>("comment");

    if (commentHandler) {
      return commentHandler.getCommentId(node);
    }

    return null;
  }, [instance, node]);

  const comment = useQuery({
    queryKey: ["standaloneComment", instanceId, managingImageId, commentId],
    queryFn: () => {
      return getStandaloneThread({
        instanceId: instanceId ?? "",
        imageId: managingImageId ?? "",
        threadId: commentId ?? "",
        userId: user?.name ?? "",
      });
    },
    enabled: typeof node !== "undefined" && commentId !== null,
  });

  const answers = useQuery({
    queryKey: [
      "standaloneComment-answers",
      instanceId,
      managingImageId,
      commentId,
    ],
    queryFn: () => {
      return getStandaloneThreadAnswers(
        instanceId,
        managingImageId ?? "",
        commentId ?? "",
        false
      );
    },
    enabled: typeof node !== "undefined" && commentId !== null,
  });

  const queryClient = useQueryClient();

  const handleRefreshComments = React.useCallback(() => {
    const queryKey = ["standaloneComments", instanceId, managingImageId];
    queryClient.invalidateQueries({
      queryKey,
    });
  }, [queryClient, instanceId, managingImageId]);

  const handleRefreshComment = React.useCallback(() => {
    const queryKeyComments = [
      "standaloneComment",
      instanceId,
      managingImageId,
      commentId,
    ];
    queryClient.invalidateQueries({ queryKey: queryKeyComments });
  }, [queryClient, instanceId, managingImageId, commentId]);

  const handleRefreshCommentAnswers = React.useCallback(() => {
    const queryKeyCommentAnswers = [
      "standaloneComment-answers",
      instanceId,
      managingImageId,
      commentId,
    ];
    queryClient.invalidateQueries({ queryKey: queryKeyCommentAnswers });
  }, [queryClient, instanceId, managingImageId, commentId]);

  React.useEffect(() => {
    const handleCommentChanged = () => {
      handleRefreshComment();
      handleRefreshComments();
    };

    window.addEventListener("onStandaloneCommentChanged", handleCommentChanged);

    return () => {
      window.removeEventListener(
        "onStandaloneCommentChanged",
        handleCommentChanged
      );
    };
  }, [handleRefreshComments]);

  return {
    commentId,
    comment,
    answers,
    handleRefreshComments,
    handleRefreshComment,
    handleRefreshCommentAnswers,
  };
};
