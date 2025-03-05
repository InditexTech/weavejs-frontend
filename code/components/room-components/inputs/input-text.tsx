"use client";

import React from "react";
import { cn } from "@/lib/utils";

type InputTextProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const InputText = ({
  label,
  value,
  onChange,
}: Readonly<InputTextProps>) => {
  const [actualValue, setActualValue] = React.useState<string>(`${value}`);

  const [inputState, setInputState] = React.useState<
    "idle" | "hover" | "focus"
  >("idle");

  React.useEffect(() => {
    setActualValue(`${value}`);
  }, [value]);

  return (
    <div
      tabIndex={0}
      className={cn(
        "pointer-events-auto flex items-center gap-2 px-2 py-2 rounded transition-all duration-200",
        {
          "border border-gray-200": inputState === "idle",
          "border border-gray-400": inputState === "hover",
          "border border-gray-800": inputState === "focus",
        }
      )}
    >
      <div className="text-xs font-medium whitespace-nowrap">{label}</div>
      <input
        type="text"
        className="w-full text-xs font-normal text-gray-700 text-right focus:outline-none bg-transparent"
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
        onMouseEnter={() => setInputState("hover")}
        onMouseLeave={() =>
          setInputState((prevState) =>
            prevState === "focus" ? "focus" : "idle"
          )
        }
        onFocus={() => setInputState("focus")}
        onBlur={() => {
          setInputState("idle");
          onChange(actualValue);
        }}
      />
    </div>
  );
};
