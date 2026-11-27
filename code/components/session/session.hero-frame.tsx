// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from "react";
import "./session.hero-frame.css";

// The depth around the hero demo (line, plane, shadows) lives in CSS, outside
// the demo's stage, so the stage can be the window alone.
export function SessionHeroFrame({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="hero-frame">
      <div className="hero-lift">{children}</div>
    </div>
  );
}
