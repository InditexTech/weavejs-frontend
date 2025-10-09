// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type VideoStatus = "pending" | "working" | "completed" | "failed";
export type VideoOperation = "uploaded";

export type VideoEntity = {
  roomId: string;
  videoId: string;
  status: VideoStatus;
  operation: VideoOperation;
  mimeType: string | null;
  fileName: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  jobId: string | null;
  removalJobId: string | null;
  removalStatus: VideoStatus | null;
  createdAt: Date;
  updatedAt: Date;
};
