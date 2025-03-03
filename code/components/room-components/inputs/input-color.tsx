"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type InputColorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export const InputColor = ({
  label,
  value,
  onChange,
}: Readonly<InputColorProps>) => {
  const [actualValue, setActualValue] = useState<string>(value);
  const [inputState, setInputState] = useState<"idle" | "hover" | "focus">(
    "idle"
  );

  useEffect(() => {
    setActualValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActualValue(e.target.value);
  };

  const handleBlur = () => {
    setInputState("idle");
    onChange(actualValue);
  };

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
      {label && (
        <label
          htmlFor="color-input"
          className="text-sm font-medium whitespace-nowrap"
        >
          {label}
        </label>
      )}
      <input
        id="color-input"
        type="text"
        className="w-full text-sm font-normal text-gray-700 text-right focus:outline-none bg-transparent"
        value={actualValue}
        onChange={handleInputChange}
        onMouseEnter={() => setInputState("hover")}
        onMouseLeave={() =>
          setInputState((prevState) =>
            prevState === "focus" ? "focus" : "idle"
          )
        }
        onFocus={() => setInputState("focus")}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            const input = e.target as HTMLInputElement;
            input.blur();
          }
        }}
      />
      <div
        className="shrink-0 w-5 h-5 border border-light-border-1 rounded-sm shadow-sm"
        style={{ background: `#${actualValue}` }}
      />
    </div>
  );
};
