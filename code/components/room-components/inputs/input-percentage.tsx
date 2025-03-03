"use client";

import React from "react";
import { cn } from "@/lib/utils";

type InputPercentageProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
};

export const InputPercentage = ({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
}: Readonly<InputPercentageProps>) => {
  const [actualValue, setActualValue] = React.useState<number>(value);
  const [inputState, setInputState] = React.useState<
    "idle" | "hover" | "focus"
  >("idle");

  React.useEffect(() => {
    setActualValue(value);
  }, [value]);

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
        <div className="text-sm font-medium whitespace-nowrap">{label}</div>
      )}
      <input
        type="text"
        className="w-full text-sm font-normal text-gray-700 text-right focus:outline-none bg-transparent"
        value={Number(actualValue * 100).toFixed(2)}
        onChange={(e) => {
          if (Number(e.target.value) <= max) {
            setActualValue(
              parseFloat(e.target.value === "" ? "0" : e.target.value) / 100
            );
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            const input = e.target as HTMLInputElement;
            input.blur();
          }
          if (e.key === "ArrowUp" && inputState === "focus") {
            e.preventDefault();
            e.stopPropagation();
            debugger;
            if (Number(actualValue * 100) + 0.01 <= max && Number(actualValue * 100) + 0.01 >= min) {
              onChange(actualValue + 0.01);
            }
          }
          if (e.key === "ArrowDown" && inputState === "focus") {
            e.preventDefault();
            e.stopPropagation();
            debugger;
            if (Number(actualValue * 100) - 0.01 <= max && Number(actualValue * 100) - 0.01 >= min) {
              onChange(actualValue - 0.01);
            }
          }
        }}
        onMouseEnter={() => setInputState("hover")}
        onMouseLeave={() =>
          setInputState((prevState) =>
            prevState === "focus" ? "focus" : "idle"
          )
        }
        onFocus={() => {
          setInputState("focus");
        }}
        onBlur={handleBlur}
      />
      <div className="text-sm font-normal text-gray-700 text-right focus:outline-none bg-transparent whitespace-nowrap">
        %
      </div>
    </div>
  );
};
