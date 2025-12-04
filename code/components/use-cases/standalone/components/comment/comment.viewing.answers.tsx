// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { CommentAnswer } from "./comment.viewing.answer";
import { WeaveCommentNodeViewAction } from "@inditextech/weave-sdk";
import { useComment } from "../../hooks/use-comment";
import { ThreadAnswerEntity } from "./types";

type CommentAnswersProps = {
  node: WeaveElementInstance;
  finish: (
    node: WeaveElementInstance,
    content: string,
    action: WeaveCommentNodeViewAction
  ) => void;
};

export const CommentAnswers = ({
  node,
  finish,
}: Readonly<CommentAnswersProps>) => {
  const {
    answers: { data: answersData, isLoading: isLoadingAnswers },
  } = useComment({ node });

  if (isLoadingAnswers) {
    return null;
  }

  if (!answersData.items) {
    return null;
  }

  if (!isLoadingAnswers && answersData.items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {answersData.items.map((answer: ThreadAnswerEntity) => (
        <CommentAnswer
          key={answer.answerId}
          node={node}
          answer={answer as ThreadAnswerEntity}
          isMain={false}
          finish={finish}
        />
      ))}
    </div>
  );
};
