import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { useRichText } from "../store";
import { DEFAULT_TEXT_STYLE } from "../constants";
import Konva from "konva";
import { updateStyles } from "../styles";

const FONT_SIZES = [
  {
    name: "mixed",
    value: -1,
  },
  {
    name: "10px",
    value: 10,
  },
  {
    name: "12px",
    value: 12,
  },
  {
    name: "14px",
    value: 14,
  },
  {
    name: "16px",
    value: 16,
  },
  {
    name: "20px",
    value: 20,
  },
  {
    name: "24px",
    value: 24,
  },
  {
    name: "28px",
    value: 28,
  },
  {
    name: "32px",
    value: 32,
  },
];

export const FontSize = () => {
  const [fontSize, setFontSize] = React.useState<number>(
    DEFAULT_TEXT_STYLE.size
  );

  const stage = useRichText((state) => state.stage);
  const style = useRichText((state) => state.style);
  const styles = useRichText((state) => state.styles);

  React.useEffect(() => {
    if (styles.length === 0) {
      setFontSize(DEFAULT_TEXT_STYLE.size);
    }
    if (styles.length === 1) {
      const fontSize = FONT_SIZES.find(
        (f) => f.value === (style?.size ?? DEFAULT_TEXT_STYLE.size)
      );

      setFontSize(fontSize?.value ?? DEFAULT_TEXT_STYLE.size);
    }
    if (styles.length > 1) {
      let fontSizeState = styles[0].size;
      for (let i = 0; i < styles.length; i++) {
        if (styles[i].size !== fontSizeState) {
          fontSizeState = -1;
          break;
        }
      }

      const size = FONT_SIZES.find((f) => f.value === fontSizeState);

      setFontSize(size?.value ?? -1);
    }
  }, [style, styles]);

  const handleFontSizeChange = React.useCallback(
    (value: number) => {
      if (stage) {
        const node = stage.findOne("#rich-text-editor") as Konva.Group;
        if (node) {
          updateStyles(node, { size: value });
        }
      }
    },
    [stage]
  );

  return (
    <Select
      value={`${fontSize}`}
      onValueChange={(value) => {
        setFontSize(Number(value));
        handleFontSizeChange(Number(value));
      }}
    >
      <SelectTrigger className="w-full !h-[40px] rounded-none cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        className="rounded-none"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          if (stage) {
            stage.container().focus();
          }
        }}
      >
        <SelectGroup>
          {FONT_SIZES.map((f) => (
            <SelectItem key={f.value} value={`${f.value}`}>
              {f.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
