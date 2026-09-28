import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { useRichText } from "../store";
import { AlignCenter, AlignRight } from "lucide-react";
import { TextAlignment } from "../types";

export const FontAlignment = () => {
  const [align, setAlign] = React.useState<TextAlignment>("left");

  const style = useRichText((state) => state.style);

  React.useEffect(() => {
    const align: TextAlignment = style?.align ?? "left";

    setAlign(align);
  }, [style]);

  return (
    <div className="flex justify-start items-center gap-'">
      <Toggle
        pressed={align === "left"}
        onPressedChange={(checked: boolean) => {
          setAlign(checked ? "left" : align);
        }}
        aria-label="Toggle bold"
        className="rounded-none cursor-pointer"
        size="sm"
        variant="outline"
      >
        <AlignCenter className="group-data-[state=on]/toggle:fill-foreground" />
      </Toggle>
      <Toggle
        pressed={align === "center"}
        onPressedChange={(checked: boolean) => {
          setAlign(checked ? "center" : align);
        }}
        aria-label="Toggle italic"
        className="rounded-none cursor-pointer"
        size="sm"
        variant="outline"
      >
        <AlignCenter className="group-data-[state=on]/toggle:fill-foreground" />
      </Toggle>
      <Toggle
        pressed={align === "right"}
        onPressedChange={(checked: boolean) => {
          setAlign(checked ? "right" : align);
        }}
        aria-label="Toggle underline"
        className="rounded-none cursor-pointer"
        size="sm"
        variant="outline"
      >
        <AlignRight className="group-data-[state=on]/toggle:fill-foreground" />
      </Toggle>
    </div>
  );
};
