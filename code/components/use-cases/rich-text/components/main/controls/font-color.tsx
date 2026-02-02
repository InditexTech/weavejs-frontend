import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorPickerInput } from "@/components/room-components/inputs/color-picker";
import { useRichText } from "../store";
import { DEFAULT_TEXT_STYLE } from "../constants";

export const FontColor = () => {
  const [open, setOpen] = React.useState(false);
  const [fontColor, setFontColor] = React.useState<string>("#000000");

  const style = useRichText((state) => state.style);
  const styles = useRichText((state) => state.styles);

  React.useEffect(() => {
    if (styles.length === 0) {
      setFontColor(DEFAULT_TEXT_STYLE.color);
    }
    if (styles.length === 1) {
      setFontColor(style?.color ?? DEFAULT_TEXT_STYLE.color);
    }
    if (styles.length > 1) {
      let fontColorState = styles[0].color;
      for (let i = 0; i < styles.length; i++) {
        if (styles[i].color !== fontColorState) {
          fontColorState = "mixed";
          break;
        }
      }

      setFontColor(fontColorState);
    }
  }, [style]);

  return (
    <DropdownMenu modal={false} open={open}>
      <DropdownMenuTrigger asChild>
        <button
          className="cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
        >
          <div
            className="w-[40px] h-[40px]"
            style={{
              background:
                fontColor === "mixed"
                  ? "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)"
                  : fontColor,
            }}
          ></div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        side="bottom"
        alignOffset={0}
        sideOffset={8}
        className="min-w-auto font-inter rounded-none shadow-none flex flex-row !z-[1000000000]"
      >
        <div
          className="flex !flex-col gap-0 w-[300px] p-4"
          onClick={(e) => e.preventDefault()}
        >
          <ColorPickerInput
            value={fontColor === "mixed" ? DEFAULT_TEXT_STYLE.color : fontColor}
            onChange={(color: string) => {
              setFontColor(color);
            }}
          />
          <Button
            onClick={() => {
              setOpen(false);
            }}
            className="cursor-pointer font-inter font-light rounded-none w-full"
          >
            CLOSE
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
