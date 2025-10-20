// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import ReactDOM from "react-dom/client";
import { Comment } from "./comment";
import { WeaveElementInstance } from "@inditextech/weave-types";
import {
  WeaveCommentNodeCreateAction,
  WeaveCommentNodeViewAction,
} from "@inditextech/weave-sdk/client";

let commentDomRoot: ReactDOM.Root | null = null;

export const closeCommentDom = () => {
  if (commentDomRoot) {
    commentDomRoot.unmount();
    commentDomRoot = null;
  }
};

export const createCommentDOM = async ({
  ele,
  node,
  finish,
}: {
  ele: HTMLDivElement;
  node: WeaveElementInstance;
  finish: (
    node: WeaveElementInstance,
    content: string,
    action: WeaveCommentNodeCreateAction
  ) => void;
}) => {
  closeCommentDom();
  commentDomRoot = ReactDOM.createRoot(ele);
  commentDomRoot.render(
    <Comment
      node={node}
      action="creating"
      finish={(node, content, action) => {
        finish(node, content, action);
      }}
      close={closeCommentDom}
    />
  );

  return Promise.resolve(true);
};

export const viewCommentDOM = async ({
  ele,
  node,
  finish,
}: {
  ele: HTMLDivElement;
  node: WeaveElementInstance;
  finish: (
    node: WeaveElementInstance,
    content: string,
    action: WeaveCommentNodeViewAction
  ) => void;
}) => {
  closeCommentDom();
  commentDomRoot = ReactDOM.createRoot(ele);
  commentDomRoot.render(
    <Comment
      node={node}
      action="viewing"
      finish={(node, content, action) => {
        finish(node, content, action);
      }}
      close={closeCommentDom}
    />
  );

  return Promise.resolve(true);
};
