"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

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

  useEffect(() => {
    setActualValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActualValue(e.target.value);
  };

  const handleBlur = () => {
    onChange(actualValue);
  };

  return (
    <div className="flex flex-col items-start justify-start relative">
      {label && (
        <div className="text-zinc-400 mb-1 text-[11px] font-noto-sans-mono font-light">
          {label}
        </div>
      )}
      <div className="w-full flex items-center relative">
        <div
          className="shrink-0 w-[32px] h-[32px] mr-1 border border-zinc-200 rounded-none"
          style={{ background: `#${actualValue}` }}
        />
        <Input
          type="text"
          className="w-full py-0 h-[32px] rounded-none !text-xs font-normal text-gray-700 text-right focus:outline-none bg-transparent shadow-none"
          value={actualValue}
          onChange={handleInputChange}
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
      </div>
    </div>
  );
};
