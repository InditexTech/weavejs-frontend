// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { WeaveFont } from "@inditextech/weave-types";

export const FONTS = async (): Promise<WeaveFont[]> => {
  const fonts: WeaveFont[] = [];

  // ARIAL FONT
  const arialRegular = new FontFace("Arial", "url(/fonts/ARIAL.TTF)", {
    weight: "400",
    style: "normal",
  });
  await arialRegular.load();
  document.fonts.add(arialRegular);

  const arialBold = new FontFace("Arial", "url(/fonts/ARIALBD.TTF)", {
    weight: "700",
    style: "normal",
  });
  await arialBold.load();
  document.fonts.add(arialBold);

  const arialItalic = new FontFace("Arial", "url(/fonts/ARIALI.TTF)", {
    weight: "400",
    style: "italic",
  });
  await arialItalic.load();
  document.fonts.add(arialItalic);

  const arialItalicBold = new FontFace("Arial", "url(/fonts/ARIALBI.TTF)", {
    weight: "700",
    style: "italic",
  });
  await arialItalicBold.load();
  document.fonts.add(arialItalicBold);

  fonts.push({
    id: "Arial",
    name: "Arial, sans-serif",
    offsetY: -1.6,
    supportedStyles: ["normal", "italic", "bold"],
  });

  // FUZZY BUBBLES

  const fuzzyBubblesRegular = new FontFace(
    "Fuzzy Bubbles",
    "url(/fonts/FuzzyBubbles-Regular.ttf)",
    { weight: "400", style: "normal" },
  );
  await fuzzyBubblesRegular.load();
  document.fonts.add(fuzzyBubblesRegular);

  const fuzzyBubblesBold = new FontFace(
    "Fuzzy Bubbles",
    "url(/fonts/FuzzyBubbles-Bold.ttf)",
    { weight: "700", style: "normal" },
  );
  await fuzzyBubblesBold.load();
  document.fonts.add(fuzzyBubblesBold);

  fonts.push({
    id: "FuzzyBubbles",
    name: "Fuzzy Bubbles, cursive",
    offsetY: -0.6,
    supportedStyles: ["normal", "bold"],
  });

  // INTER FONT
  const interRegular = new FontFace("Inter", "url(/fonts/inter-regular.ttf)", {
    weight: "400",
    style: "normal",
  });
  await interRegular.load();
  document.fonts.add(interRegular);

  const interBold = new FontFace("Inter", "url(/fonts/inter-bold.ttf)", {
    weight: "700",
    style: "normal",
  });
  await interBold.load();
  document.fonts.add(interBold);

  const interItalic = new FontFace("Inter", "url(/fonts/inter-italic.ttf)", {
    weight: "400",
    style: "italic",
  });
  await interItalic.load();
  document.fonts.add(interItalic);

  const interItalicBold = new FontFace(
    "Inter",
    "url(/fonts/inter-italic-bold.ttf)",
    { weight: "700", style: "italic" },
  );
  await interItalicBold.load();
  document.fonts.add(interItalicBold);

  fonts.push({
    id: "Inter",
    name: `Inter, sans-serif`,
    offsetY: -1.4,
    supportedStyles: ["normal", "italic", "bold"],
  });

  // NOTO SANS MONO

  const notoSansMonoRegular = new FontFace(
    "Noto Sans Mono",
    "url(/fonts/NotoSansMono-Regular.ttf)",
    { weight: "400", style: "normal" },
  );
  await notoSansMonoRegular.load();
  document.fonts.add(notoSansMonoRegular);

  const notoSansMonoBold = new FontFace(
    "Noto Sans Mono",
    "url(/fonts/NotoSansMono-Bold.ttf)",
    { weight: "700", style: "normal" },
  );
  await notoSansMonoBold.load();
  document.fonts.add(notoSansMonoBold);

  fonts.push({
    id: "Noto Sans Mono",
    name: "Noto Sans Mono, monospace",
    offsetY: -0.6,
    supportedStyles: ["normal", "bold"],
  });

  // ROBOTO MONO FONT

  const robotoMonoRegular = new FontFace(
    "RobotoMono",
    "url(/fonts/RobotoMono-Regular.ttf)",
    { weight: "400", style: "normal" },
  );
  await robotoMonoRegular.load();
  document.fonts.add(robotoMonoRegular);

  const robotoMonoItalic = new FontFace(
    "RobotoMono",
    "url(/fonts/RobotoMono-Italic.ttf)",
    { weight: "400", style: "italic" },
  );
  await robotoMonoItalic.load();
  document.fonts.add(robotoMonoItalic);

  const robotoMonoBold = new FontFace(
    "RobotoMono",
    "url(/fonts/RobotoMono-Bold.ttf)",
    { weight: "700", style: "normal" },
  );
  await robotoMonoBold.load();
  document.fonts.add(robotoMonoBold);

  const robotoMonoItalicBold = new FontFace(
    "RobotoMono",
    "url(/fonts/RobotoMono-BoldItalic.ttf)",
    { weight: "700", style: "italic" },
  );
  await robotoMonoItalicBold.load();
  document.fonts.add(robotoMonoItalicBold);

  fonts.push({
    id: "RobotoMono",
    name: "Roboto Mono, monospace",
    offsetY: -0.6,
    supportedStyles: ["normal", "italic", "bold"],
  });

  // SANSITA FONT

  const sansitaRegular = new FontFace(
    "Sansita",
    "url(/fonts/sansita-regular.ttf)",
    { weight: "400", style: "normal" },
  );
  await sansitaRegular.load();
  document.fonts.add(sansitaRegular);

  const sansitaBold = new FontFace("Sansita", "url(/fonts/sansita-bold.ttf)", {
    weight: "700",
    style: "normal",
  });
  await sansitaBold.load();
  document.fonts.add(sansitaBold);

  fonts.push({
    id: "Sansita",
    name: `Sansita, sans-serif`,
    offsetY: -1.6,
    supportedStyles: ["normal", "bold"],
  });

  // SPECIAL GOTHIC CONDENSED

  const specialGothicCondensedOneRegular = new FontFace(
    "Special Gothic Condensed One",
    "url(/fonts/SpecialGothicCondensedOne-Regular.ttf)",
    { weight: "400", style: "normal" },
  );
  await specialGothicCondensedOneRegular.load();
  document.fonts.add(specialGothicCondensedOneRegular);

  fonts.push({
    id: "SpecialGothicCondensedOne",
    name: "Special Gothic Condensed One, sans-serif",
    offsetY: -0.6,
    supportedStyles: ["normal"],
  });

  return fonts;
};
