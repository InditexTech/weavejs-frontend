import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const LAYOUTS = [
  {
    name: "Auto",
    value: "auto-width",
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
  const [layout, setLayout] = React.useState<string>(LAYOUTS[1].value);

  const selectedLayout = LAYOUTS.find((f) => f.value === layout);

  return (
    <Select
      value={layout}
      onValueChange={(value) => {
        setLayout(value);
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
