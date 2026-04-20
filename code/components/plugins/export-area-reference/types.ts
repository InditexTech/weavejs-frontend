// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type ExportAreaReferenceSize = {
  width: number;
  height: number;
};

export type ExportAreaReferencePluginParams = {
  config: ExportAreaReferencePluginConfig;
};

export type ExportAreaReferencePluginConfig = {
  initialSize: string;
  sizes: Record<string, ExportAreaReferenceSize>;
};
