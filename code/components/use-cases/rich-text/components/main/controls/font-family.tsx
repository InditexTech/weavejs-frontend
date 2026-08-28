import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useRichText } from "../store";
import { DEFAULT_TEXT_STYLE } from "../constants";
import { updateStyles } from "../styles";
import Konva from "konva";

const FONT_FAMILIES = [
  {
    name: "mixed",
    value: "mixed",
  },
  {
    name: "Arial",
    value: "Arial, sans-serif",
  },
  {
    name: "Helvetica",
    value: "Helvetica, sans-serif",
  },
  {
    name: "Monospaced",
    value: "monospace",
  },
  {
    name: "Impact",
    value: "Impact, sans-serif",
  },
];

export const FontFamily = () => {
  const [fontFamily, setFontFamily] = React.useState<string>(
    DEFAULT_TEXT_STYLE.font,
  );

  const stage = useRichText((state) => state.stage);
  const style = useRichText((state) => state.style);
  const styles = useRichText((state) => state.styles);

  React.useEffect(() => {
    if (styles.length === 0) {
      setFontFamily(DEFAULT_TEXT_STYLE.font);
    }
    if (styles.length === 1) {
      const fontFamily = FONT_FAMILIES.find(
        (f) => f.value === (style?.font ?? DEFAULT_TEXT_STYLE.font),
      );

      setFontFamily(fontFamily?.value ?? DEFAULT_TEXT_STYLE.font);
    }
    if (styles.length > 1) {
      let fontFamilyState = styles[0].font;
      for (let i = 0; i < styles.length; i++) {
        if (styles[i].font !== fontFamilyState) {
          fontFamilyState = "mixed";
          break;
        }
      }

      const font = FONT_FAMILIES.find((f) => f.value === fontFamilyState);

      setFontFamily(font?.value ?? "mixed");
    }
  }, [style, styles]);

  const handleFontChange = React.useCallback(
    (value: string) => {
      if (stage) {
        const node = stage.findOne("#rich-text-editor") as Konva.Group;
        if (node) {
          updateStyles(node, { font: value });
        }
      }
    },
    [stage],
  );

  const selectedFontFamily = FONT_FAMILIES.find((f) => f.value === fontFamily);

  return (
    <Select
      value={fontFamily}
      onValueChange={(value) => {
        setFontFamily(value);
        handleFontChange(value);
      }}
    >
      <SelectTrigger
        className="w-full !h-[40px] rounded-none cursor-pointer font-sans"
        style={{
          fontFamily: fontFamily === "mixed" ? undefined : fontFamily,
        }}
      >
        {selectedFontFamily?.name || "Select a font"}
      </SelectTrigger>
      <SelectContent className="rounded-none">
        <SelectGroup>
          {FONT_FAMILIES.map((f) => (
            <SelectItem
              key={f.value}
              value={f.value}
              className="font-sans"
              style={{
                fontFamily: f.value === "mixed" ? undefined : f.value,
              }}
            >
              {f.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
