// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { mergeExceptArrays } from "@inditextech/weave-sdk";
import { BACKGROUND_COLOR, BackgroundColor, ViewType } from "@/store/store";

type WeaveSessionConfig = {
  viewType: ViewType;
  ai: {
    prompt: {
      visible: boolean;
    };
  };
  ui: {
    usersPointers: {
      visible: boolean;
    };
    comments: {
      visible: boolean;
    };
    referenceArea: {
      visible: boolean;
    };
  };
  grid: {
    enabled: boolean;
    type: "lines" | "dots";
    dotsKind: "square" | "circle";
  };
  backgroundColor: BackgroundColor;
};

const defaultSessionConfig: WeaveSessionConfig = {
  viewType: "floating",
  ai: {
    prompt: {
      visible: true,
    },
  },
  ui: {
    usersPointers: {
      visible: true,
    },
    comments: {
      visible: true,
    },
    referenceArea: {
      visible: true,
    },
  },
  grid: {
    enabled: false,
    type: "lines",
    dotsKind: "square",
  },
  backgroundColor: BACKGROUND_COLOR.GRAY,
};

export const getSessionConfig = (room: string): WeaveSessionConfig => {
  const configJson = sessionStorage.getItem(`weave.js_${room}_config`);

  if (!configJson) {
    return defaultSessionConfig;
  }

  const finalConfigJson = mergeExceptArrays(
    defaultSessionConfig,
    configJson ? JSON.parse(configJson) : {},
  );

  return finalConfigJson;
};

export const setSessionConfig = (room: string, config: WeaveSessionConfig) => {
  sessionStorage.setItem(`weave.js_${room}_config`, JSON.stringify(config));
};
