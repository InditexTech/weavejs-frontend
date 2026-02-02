import { TextStyle } from "./types";

export const GUIDES = {
  ["BOUNDS"]: true,
  ["BASELINES"]: true,
  ["SEGMENTS"]: true,
};

export const EXAMPLE_MODEL = [
  {
    text: "How to render rich text\n",
    size: 32,
  },
  {
    text: "\nFirst",
    style: "bold",
    size: 24,
  },
  {
    text: " of all is pretty complex: even if you have previous experience, a lot of variables to take into account, then ",
  },
  {
    text: "run",
    font: "monospace",
    // size: 24,
    style: "bold",
    color: "#cc00cc",
  },
  {
    text: ", ",
  },
  {
    text: "this is not for you",
    decoration: "underline",
  },
  {
    text: ". ",
  },
  {
    text: "Right",
    size: 24,
    style: "bold",
    color: "#cc0000",
  },
  {
    text: " now it ",
  },
  {
    text: "support limited rich-text features",
    decoration: "line-through",
  },
  {
    text: ". In the future we may extend the support for other ",
  },
  {
    text: "features",
    size: 24,
    style: "bold italic",
  },
  {
    text: "!.\n\nWill this work?.",
  },
];

export const DEFAULT_TEXT_STYLE: TextStyle = {
  size: 16,
  style: "normal",
  decoration: "none",
  align: "left",
  font: "Arial, sans-serif",
  color: "#000000",
  lineHeight: 1,
};
