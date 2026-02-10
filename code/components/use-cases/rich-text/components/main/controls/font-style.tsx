import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { useRichText } from "../store";
import { Bold, Italic, Minus, Strikethrough, Underline } from "lucide-react";
import { DEFAULT_TEXT_STYLE } from "../constants";
import { updateStyles } from "../styles";
import Konva from "konva";

type ToggleState = "on" | "off" | "mixed";

export const FontStyle = () => {
  const [bold, setBold] = React.useState<ToggleState>("off");
  const [italic, setItalic] = React.useState<ToggleState>("off");
  const [underline, setUnderline] = React.useState<ToggleState>("off");
  const [strikeThrough, setStrikeThrough] = React.useState<ToggleState>("off");

  const stage = useRichText((state) => state.stage);
  const style = useRichText((state) => state.style);
  const styles = useRichText((state) => state.styles);

  React.useEffect(() => {
    if (styles.length === 0) {
      setBold(DEFAULT_TEXT_STYLE.style.includes("bold") ? "on" : "off");
      setItalic(DEFAULT_TEXT_STYLE.style.includes("italic") ? "on" : "off");
      setUnderline(
        DEFAULT_TEXT_STYLE.decoration.includes("underline") ? "on" : "off",
      );
      setStrikeThrough(
        DEFAULT_TEXT_STYLE.decoration.includes("line-through") ? "on" : "off",
      );
    }
    if (styles.length === 1) {
      const boldState = style?.style.includes("bold") ? "on" : "off";
      const italicState = style?.style.includes("italic") ? "on" : "off";
      const underlineState = style?.decoration.includes("underline")
        ? "on"
        : "off";
      const strikeThroughState = style?.decoration.includes("line-through")
        ? "on"
        : "off";

      setBold(boldState);
      setItalic(italicState);
      setUnderline(underlineState);
      setStrikeThrough(strikeThroughState);
    }
    if (styles.length > 1) {
      let boldState: ToggleState = "mixed";
      const boldStyles = styles.map((s) =>
        s.style.includes("bold") ? "bold" : "",
      );
      if (boldStyles.every((s) => s === "bold")) {
        boldState = "on";
      } else if (boldStyles.every((s) => s === "")) {
        boldState = "off";
      }

      setBold(boldState);

      let italicState: ToggleState = "mixed";
      const italicStyles = styles.map((s) =>
        s.style.includes("italic") ? "italic" : "",
      );
      if (italicStyles.every((s) => s === "italic")) {
        italicState = "on";
      } else if (italicStyles.every((s) => s === "")) {
        italicState = "off";
      }

      setItalic(italicState);

      let underlineState: ToggleState = "mixed";
      const underlineStyles = styles.map((s) =>
        s.decoration.includes("underline") ? "underline" : "",
      );
      if (underlineStyles.every((s) => s === "underline")) {
        underlineState = "on";
      } else if (underlineStyles.every((s) => s === "")) {
        underlineState = "off";
      }

      setUnderline(underlineState);

      let strikeThroughState: ToggleState = "mixed";
      const strikeThroughStyles = styles.map((s) =>
        s.decoration.includes("line-through") ? "line-through" : "",
      );
      if (strikeThroughStyles.every((s) => s === "line-through")) {
        strikeThroughState = "on";
      } else if (strikeThroughStyles.every((s) => s === "")) {
        strikeThroughState = "off";
      }
      setStrikeThrough(strikeThroughState);
    }
  }, [style, styles]);

  const handleStyleChange = React.useCallback(
    (value: string) => {
      if (stage) {
        const node = stage.findOne("#rich-text-editor") as Konva.Group;
        if (node) {
          updateStyles(node, { style: value });
        }
      }
    },
    [stage],
  );

  const handleDecorationChange = React.useCallback(
    (value: string) => {
      if (stage) {
        const node = stage.findOne("#rich-text-editor") as Konva.Group;
        if (node) {
          updateStyles(node, { decoration: value });
        }
      }
    },
    [stage],
  );

  return (
    <div className="flex justify-start items-center gap-1">
      <Toggle
        pressed={bold === "on"}
        onPressedChange={(checked: boolean) => {
          setBold(checked ? "on" : "off");

          const newStyle = [];
          if (checked) {
            newStyle.push("bold");
          }
          if (italic === "on") {
            newStyle.push("italic");
          }

          handleStyleChange(newStyle.join(" "));
        }}
        aria-label="Toggle bold"
        className="rounded-none cursor-pointer"
        size="sm"
        variant="outline"
      >
        {bold === "mixed" ? (
          <Minus />
        ) : (
          <Bold className="group-data-[state=on]/toggle:fill-foreground" />
        )}
      </Toggle>
      <Toggle
        pressed={italic === "on"}
        onPressedChange={(checked: boolean) => {
          setItalic(checked ? "on" : "off");

          const newStyle = [];
          if (bold === "on") {
            newStyle.push("bold");
          }
          if (checked) {
            newStyle.push("italic");
          }

          handleStyleChange(newStyle.join(" "));
        }}
        aria-label="Toggle italic"
        className="rounded-none cursor-pointer"
        size="sm"
        variant="outline"
      >
        {italic === "mixed" ? (
          <Minus />
        ) : (
          <Italic className="group-data-[state=on]/toggle:fill-foreground" />
        )}
      </Toggle>
      <Toggle
        pressed={underline === "on"}
        onPressedChange={(checked: boolean) => {
          setUnderline(checked ? "on" : "off");

          const newDecoration = [];
          if (checked) {
            newDecoration.push("underline");
          }
          if (strikeThrough === "on") {
            newDecoration.push("line-through");
          }

          handleDecorationChange(newDecoration.join(" "));
        }}
        aria-label="Toggle underline"
        className="rounded-none cursor-pointer"
        size="sm"
        variant="outline"
      >
        {underline === "mixed" ? (
          <Minus />
        ) : (
          <Underline className="group-data-[state=on]/toggle:fill-foreground" />
        )}
      </Toggle>
      <Toggle
        pressed={strikeThrough === "on"}
        onPressedChange={(checked: boolean) => {
          setStrikeThrough(checked ? "on" : "off");

          const newDecoration = [];
          if (underline === "on") {
            newDecoration.push("underline");
          }
          if (checked) {
            newDecoration.push("line-through");
          }

          handleDecorationChange(newDecoration.join(" "));
        }}
        aria-label="Toggle strike-through"
        className="rounded-none cursor-pointer"
        size="sm"
        variant="outline"
      >
        {strikeThrough === "mixed" ? (
          <Minus />
        ) : (
          <Strikethrough className="group-data-[state=on]/toggle:fill-foreground" />
        )}
      </Toggle>
    </div>
  );
};
