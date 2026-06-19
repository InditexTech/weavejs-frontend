// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveFont } from "@inditextech/weave-types";
import { type WeaveFontFamily } from "@inditextech/weave-sdk";

const loadArialFontFamily = (): WeaveFontFamily => {
  return {
    family: "Arial",
    offset: {
      x: 0,
      y: 0.6,
    },
    supportedStyles: ["normal", "italic", "bold"],
    fontFaces: [
      {
        weight: "400",
        style: "normal",
        source: "url(/fonts/ARIAL.TTF)",
      },
      {
        weight: "700",
        style: "normal",
        source: "url(/fonts/ARIALBD.TTF)",
      },
      {
        weight: "400",
        style: "italic",
        source: "url(/fonts/ARIALI.TTF)",
      },
      {
        weight: "700",
        style: "italic",
        source: "url(/fonts/ARIALBI.TTF)",
      },
    ],
  };
};

const loadFuzzyBubblesFontFamily = (): WeaveFontFamily => {
  return {
    family: "Fuzzy Bubbles",
    offset: {
      x: 0,
      y: 1.1,
    },
    supportedStyles: ["normal", "bold"],
    fontFaces: [
      {
        weight: "400",
        style: "normal",
        source: "url(/fonts/FuzzyBubbles-Regular.ttf)",
      },
      {
        weight: "700",
        style: "normal",
        source: "url(/fonts/FuzzyBubbles-Bold.ttf)",
      },
    ],
  };
};

const loadInterFontFamily = (): WeaveFontFamily => {
  return {
    family: "Inter",
    offset: {
      x: 0,
      y: 1.1,
    },
    supportedStyles: ["normal", "italic", "bold"],
    fontFaces: [
      {
        weight: "400",
        style: "normal",
        source: "url(/fonts/inter-regular.ttf)",
      },
      {
        weight: "700",
        style: "normal",
        source: "url(/fonts/inter-bold.ttf)",
      },
      {
        weight: "400",
        style: "italic",
        source: "url(/fonts/inter-italic.ttf)",
      },
      {
        weight: "700",
        style: "italic",
        source: "url(/fonts/inter-italic-bold.ttf)",
      },
      {
        weight: "300",
        style: "normal",
        source: "url(/fonts/Inter_18pt-Light.ttf)",
      },
      {
        weight: "300",
        style: "italic",
        source: "url(/fonts/Inter_18pt-LightItalic.ttf)",
      },
    ],
  };
};

const loadNotoSansFontFamily = (): WeaveFontFamily => {
  return {
    family: "Noto Sans Mono",
    offset: {
      x: 0,
      y: 1.2,
    },
    supportedStyles: ["normal", "bold"],
    fontFaces: [
      {
        weight: "400",
        style: "normal",
        source: "url(/fonts/NotoSansMono-Regular.ttf)",
      },
      {
        weight: "700",
        style: "normal",
        source: "url(/fonts/NotoSansMono-Bold.ttf)",
      },
    ],
  };
};

const loadRobotoFontFamily = (): WeaveFontFamily => {
  return {
    family: "Roboto Mono",
    offset: {
      x: 0,
      y: 0.8,
    },
    supportedStyles: ["normal", "italic", "bold"],
    fontFaces: [
      {
        weight: "400",
        style: "normal",
        source: "url(/fonts/RobotoMono-Regular.ttf)",
      },
      {
        weight: "400",
        style: "italic",
        source: "url(/fonts/RobotoMono-Italic.ttf)",
      },
      {
        weight: "700",
        style: "normal",
        source: "url(/fonts/RobotoMono-Bold.ttf)",
      },
      {
        weight: "700",
        style: "italic",
        source: "url(/fonts/RobotoMono-BoldItalic.ttf)",
      },
    ],
  };
};

const loadSansitaFontFamily = (): WeaveFontFamily => {
  return {
    family: "Sansita",
    offset: {
      x: 0,
      y: 0.5,
    },
    supportedStyles: ["normal", "bold"],
    fontFaces: [
      {
        weight: "400",
        style: "normal",
        source: "url(/fonts/sansita-regular.ttf)",
      },
      {
        weight: "700",
        style: "normal",
        source: "url(/fonts/sansita-bold.ttf)",
      },
    ],
  };
};

const loadSpecialGothicCondensedFontFamily = (): WeaveFontFamily => {
  return {
    family: "Special Gothic Condensed One",
    offset: {
      x: 0,
      y: 1.1,
    },
    supportedStyles: ["normal"],
    fontFaces: [
      {
        weight: "400",
        style: "normal",
        source: "url(/fonts/SpecialGothicCondensedOne-Regular.ttf)",
      },
    ],
  };
};

export const FONTS = async (
  loadFontsFamilies: (fontFamilies: WeaveFontFamily[]) => Promise<WeaveFont[]>,
): Promise<WeaveFont[]> => {
  const fontFamilies: WeaveFontFamily[] = [];

  fontFamilies.push(loadArialFontFamily());
  fontFamilies.push(loadFuzzyBubblesFontFamily());
  fontFamilies.push(loadInterFontFamily());
  fontFamilies.push(loadNotoSansFontFamily());
  fontFamilies.push(loadRobotoFontFamily());
  fontFamilies.push(loadSansitaFontFamily());
  fontFamilies.push(loadSpecialGothicCondensedFontFamily());

  const fonts = await loadFontsFamilies(fontFamilies);

  return fonts;
};
