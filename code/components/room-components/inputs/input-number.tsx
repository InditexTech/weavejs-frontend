"use client";

import React from "react";
import { cn } from "@/lib/utils";

type InputNumberProps = {
  label?: string;
  disabled?: boolean;
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

export const InputNumber = ({
  label,
  value,
  onChange,
  disabled = false,
  max = Infinity,
}: Readonly<InputNumberProps>) => {
  const [inputState, setInputState] = React.useState<
    "idle" | "hover" | "focus"
  >("idle");
  const [actualValue, setActualValue] = React.useState<string>(`${value}`);

  React.useEffect(() => {
    setActualValue(`${value}`);
  }, [value]);

  const handleBlur = () => {
    let numberToSave = actualValue === "" ? "0" : actualValue;
    numberToSave = numberToSave.replace(/^0+/, "");
    if (isNaN(parseFloat(numberToSave))) {
      numberToSave = "0";
    }
    setInputState("idle");
    onChange(parseFloat(actualValue));
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
        <label htmlFor="color-input" className="text-xs font-medium whitespace-nowrap">
          {label}
        </label>
      )}
        <input
          type="number"
          disabled={disabled}
          max={max}
          className="w-full text-xs font-normal text-gray-700 text-right focus:outline-none bg-transparent"
          value={`${Number(actualValue).toFixed(2)}`}
          step=".01"
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
          onBlur={handleBlur}
        />
      </div>
  );
};
