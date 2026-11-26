// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/** The room's footer; its overlay layer runs underneath it. */
export const ROOM_FOOTER_HEIGHT = 40;

const SIDEBAR_WIDTH = 500;
/** The floating right sidebar sits 8px from the edge. */
const FLOATING_SIDEBAR_CLEARANCE = SIDEBAR_WIDTH + 8;

/** Space the pen bar keeps clear on each side so it stays centred in the free canvas. */
export function penBarInsets(
  viewType: string | undefined,
  rightSidebarOpen: boolean,
): { insetLeft: number; insetRight: number } {
  if (!viewType || viewType === "fixed") {
    return { insetLeft: SIDEBAR_WIDTH, insetRight: SIDEBAR_WIDTH };
  }
  return {
    insetLeft: 0,
    insetRight: rightSidebarOpen ? FLOATING_SIDEBAR_CLEARANCE : 0,
  };
}
