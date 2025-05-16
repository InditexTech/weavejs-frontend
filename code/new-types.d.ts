// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

interface Window {
  weave: Weave;
  weaveOnFieldFocus?: boolean;
  weaveTextEditing?: Record<string, string>;
  weaveDragImageURL?: string;
  colorTokenDragColor?: string;
}

declare module "platform-detect";
