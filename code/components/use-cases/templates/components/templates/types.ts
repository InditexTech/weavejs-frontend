// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type TemplateStatus = "pending" | "working" | "completed" | "failed";

export type TemplateEntity = {
  roomId: string;
  templateId: string;
  status: TemplateStatus;
  name: string;
  linkedNodeType: string | null;
  templateImage: string;
  templateData: string;
  jobId: string | null;
  removalJobId: string | null;
  removalStatus: TemplateStatus | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WeaveTemplateDragParams = {
  templateData: string;
};

export type ImageTemplateMetadata = {
  key: string;
  width: number;
  height: number;
};
