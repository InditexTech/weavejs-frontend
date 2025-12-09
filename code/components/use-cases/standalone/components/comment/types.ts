// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveUser } from "@inditextech/weave-types";

export type ThreadStatus = "pending" | "resolved";

export type ThreadEntity = {
  threadId: string;
  userId: string;
  roomId: string;
  userMetadata: WeaveUser;
  x: number;
  y: number;
  status: ThreadStatus;
  content: string;
  replies: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ThreadAnswerEntity = {
  answerId: string;
  threadId: string;
  userId: string;
  userMetadata: WeaveUser;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};
