// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { BACKGROUND_COLOR, BackgroundColor } from "@/store/store";

type WeaveSessionConfig = {
  grid: {
    enabled: boolean;
    type: "lines" | "dots";
  };
  backgroundColor: BackgroundColor;
};

const defaultSessionConfig: WeaveSessionConfig = {
  grid: {
    enabled: true,
    type: "lines",
  },
  backgroundColor: BACKGROUND_COLOR.WHITE,
};

export const getSessionConfig = (room: string): WeaveSessionConfig => {
  const configJson = sessionStorage.getItem(`weave.js_${room}_config`);

  if (!configJson) {
    return defaultSessionConfig;
  }

  try {
    return JSON.parse(configJson);
  } catch {
    return defaultSessionConfig;
  }
};

export const setSessionConfig = (room: string, config: WeaveSessionConfig) => {
  sessionStorage.setItem(`weave.js_${room}_config`, JSON.stringify(config));
};
