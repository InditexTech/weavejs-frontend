import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useRichText } from "../store";
import Konva from "konva";
import { updateLayout } from "../layout";
import { TextLimits, type TextLayout as TextLayoutType } from "../types";

const LAYOUTS = [
  {
    name: "Auto",
    value: "auto",
  },
  {
    name: "Fixed width",
    value: "fixed-width",
  },
  {
    name: "Fixed",
    value: "fixed",
  },
];

export const TextLayout = () => {
  const stage = useRichText((state) => state.stage);
  const layout = useRichText((state) => state.layout);
  const setLayout = useRichText((state) => state.setLayout);

  const selectedLayout = LAYOUTS.find((f) => f.value === layout);

  const handleLayoutChange = React.useCallback(
    (value: TextLayoutType, limits: TextLimits) => {
      if (stage) {
        const node = stage.findOne("#rich-text-editor") as Konva.Group;
        if (node) {
          updateLayout(node, value, limits);
        }
      }
    },
    [stage],
  );

  return (
    <Select
      value={selectedLayout?.value}
      onValueChange={(value) => {
        setLayout(value as TextLayoutType);

        switch (value as TextLayoutType) {
          case "fixed-width":
            handleLayoutChange(value as TextLayoutType, {
              width: 500,
              height: Infinity,
            });
            break;

          case "fixed":
            handleLayoutChange(value as TextLayoutType, {
              width: 500,
              height: 500,
            });
            break;

          default:
            handleLayoutChange(value as TextLayoutType, {
              width: Infinity,
              height: Infinity,
            });
            break;
        }
      }}
    >
      <SelectTrigger className="w-full !h-[40px] rounded-none cursor-pointer">
        {selectedLayout?.name || "Select a layout"}
      </SelectTrigger>
      <SelectContent className="rounded-none">
        <SelectGroup>
          {LAYOUTS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
