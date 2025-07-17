// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import * as React from "react";

export const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (navigator.maxTouchPoints > 0 || "ontouchstart" in window)
    ) {
      setIsTouch(true);
    }
  }, []);

  return isTouch;
};
