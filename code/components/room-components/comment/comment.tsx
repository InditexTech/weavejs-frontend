// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WeaveElementInstance } from "@inditextech/weave-types";
import { CommentCreating } from "./comment.creating";
import { CommentViewing } from "./comment.viewing";
import {
  WeaveCommentNodeCreateAction,
  WeaveCommentNodeViewAction,
} from "@inditextech/weave-sdk";

const queryClient = new QueryClient();

type CommentProps = {
  node: WeaveElementInstance;
} & (
  | {
      action: "creating";
      finish: (
        node: WeaveElementInstance,
        content: string,
        action: WeaveCommentNodeCreateAction
      ) => void;
      close: () => void;
    }
  | {
      action: "viewing";
      finish: (
        node: WeaveElementInstance,
        content: string,
        action: WeaveCommentNodeViewAction
      ) => void;
      close: () => void;
    }
);

export const Comment = ({
  node,
  action,
  finish,
  close,
}: Readonly<CommentProps>) => {
  if (action === "creating") {
    return <CommentCreating node={node} finish={finish} close={close} />;
  }

  if (action === "viewing") {
    return (
      <QueryClientProvider client={queryClient}>
        <CommentViewing node={node} finish={finish} close={close} />
      </QueryClientProvider>
    );
  }

  return null;
};
