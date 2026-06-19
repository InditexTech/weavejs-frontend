// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";

export class GroupImageWithTitle extends Konva.Group {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getClientRect(config?: any) {
    const id = this.getAttr("id");

    const imageInstance = this.findOne(`#${id}-img`) as Konva.Group;

    if (!imageInstance) {
      return super.getClientRect(config);
    }

    if (imageInstance.getAttr("id") === this.getAttr("id")) {
      return super.getClientRect(config);
    }

    const rect = imageInstance.getClientRect(config);

    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }
}
