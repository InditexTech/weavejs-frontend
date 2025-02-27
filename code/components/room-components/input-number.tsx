"use client";

import React from "react";
import { cn } from "@/lib/utils";

type InputNumberProps = {
  label?: string;
  disabled?: boolean;
  value: number;
  onChange: (value: number) => void;
};

export const InputNumber = ({ label, value, onChange, disabled = false }: Readonly<InputNumberProps>) => {
  const [focused, setFocused] = React.useState<boolean>(false);
  const [actualValue, setActualValue] = React.useState<string>(`${value}`);

  React.useEffect(() => {
    setActualValue(`${value}`);
  }, [value]);

  return (
    <div
      tabIndex={0}
      className={cn("pointer-events-auto w-full flex gap-1 justify-between items-center border rounded px-2 py-1", {
        ["bg-light-background-3"]: disabled,
        ["border-light-border-3"]: !focused,
        ["border-light-semantic-highlight-2"]: focused,
      })}
    >
      {label && <div className="font-detail-m-light text-light-content-3 whitespace-nowrap">{label}</div>}
      <input
        type="number"
        disabled={disabled}
        className="w-full text-right focus:border-light-border-3"
        value={`${actualValue}`}
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
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          let numberToSave = actualValue === "" ? "0" : actualValue;
          numberToSave = numberToSave.replace(/^0+/, "");
          if (isNaN(parseFloat(numberToSave))) {
            numberToSave = "0";
          }
          setFocused(false);
          onChange(parseFloat(actualValue));
        }}
      />
    </div>
  );
};
