// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { detectOS, SYSTEM_OS, SystemOs } from "@/lib/utils";
import React from "react";

export const useGetOs = () => {
  const [os, setOs] = React.useState<SystemOs>(SYSTEM_OS.OTHER);

  React.useEffect(() => {
    setOs(detectOS());
  }, []);

  return os;
};
