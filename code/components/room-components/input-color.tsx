"use client";

import React from "react";
import { cn } from "@/lib/utils";

type InputColorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export const InputColor = ({ label, value, onChange }: Readonly<InputColorProps>) => {
  const [focused, setFocused] = React.useState<boolean>(false);
  const [actualValue, setActualValue] = React.useState<string>(value);

  React.useEffect(() => {
    setActualValue(value);
  }, [value]);

  return (
    <div
      tabIndex={0}
      className={cn("pointer-events-auto w-full flex gap-1 justify-between items-center border rounded px-2 py-1", {
        ["border-light-border-3"]: !focused,
        ["border-light-semantic-highlight-2"]: focused,
      })}
    >
      {label && <div className="font-detail-m-light text-light-content-3 whitespace-nowrap">{label}</div>}
      <input
        type="text"
        className="w-full text-right focus:border-light-border-3"
        value={actualValue}
        onChange={(e) => {
          setActualValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            const input = e.target as HTMLInputElement;
            input.blur();
          }
        }}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
          onChange(actualValue);
        }}
      />
      <div
        className="shrink-0 w-[16px] h-[16px] border border-light-border-1"
        style={{ background: `#${actualValue}` }}
      />
    </div>
  );
};
