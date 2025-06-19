// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { NumberInput } from "./number-input";
import { cn } from "@/lib/utils";

type InputNumberProps = {
  label?: string;
  className?: string;
  disabled?: boolean;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
};

export const InputNumber = ({
  label,
  value,
  onChange,
  className,
  disabled = false,
  min = -Infinity,
  max = Infinity,
}: Readonly<InputNumberProps>) => {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const input = e.target as HTMLInputElement;
        input.blur();
      }
    },
    []
  );

  const handleOnValueChange = React.useCallback(
    (numberValue: number | undefined) => {
      onChange?.(numberValue ?? 0);
    },
    [onChange]
  );

  return (
    <NumberInput
      label={label}
      disabled={disabled}
      min={min}
      max={max}
      decimalScale={2}
      className={cn(
        "w-full text-[3px] font-normal text-gray-700 text-right focus:outline-none bg-transparent",
        className
      )}
      value={Number(value)}
      onValueChange={handleOnValueChange}
      onKeyDown={handleKeyDown}
    />
  );
};
