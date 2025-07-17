// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPickerInput } from "./color-picker";

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
  const editingRef = React.useRef<HTMLInputElement>(null);
  const [enterPressed, setEnterPressed] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<boolean>(false);
  const [editedValue, setEditedValue] = React.useState<string>(value);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const input = e.target as HTMLInputElement;
        input.blur();
        setEnterPressed(true);
      }
    },
    []
  );

  const handleOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedValue(e.target.value === "" ? "#ffffff" : e.target.value);
    },
    []
  );

  React.useEffect(() => {
    if (editingRef.current) {
      editingRef.current.focus();
    }
  }, [editing]);

  return (
    <div className="flex flex-col items-start justify-start relative">
      {label && (
        <div className="text-[#757575] mb-1 text-[12px] font-inter font-light">
          {label}
        </div>
      )}
      <div className="w-full flex items-center relative">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="cursor-pointer shrink-0 w-[40px] h-[40px] mr-1 border border-[#c9c9c9] rounded-none"
              style={{ background: value }}
            />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="left"
            alignOffset={0}
            sideOffset={9}
            className="rounded-none border-[#c9c9c9] w-[300px]"
          >
            <ColorPickerInput
              value={value}
              onChange={(color) => {
                onChange(color as string);
              }}
            />
          </PopoverContent>
        </Popover>
        {!editing && (
          <Input
            type="text"
            className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-right focus:outline-none bg-transparent shadow-none"
            value={value ?? "#000000ff"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (enterPressed) {
                onChange?.(e.target.value);
                setEnterPressed(false);
              }
            }}
            onFocus={() => {
              setEditing(true);
              setEditedValue(value ?? "#000000ff");
              window.weaveOnFieldFocus = true;
            }}
          />
        )}
        {editing && (
          <Input
            ref={editingRef}
            type="text"
            className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-right focus:outline-none bg-transparent shadow-none"
            value={editedValue}
            onChange={handleOnChange}
            onBlurCapture={() => {
              window.weaveOnFieldFocus = false;
              setEditing(false);
              onChange(editedValue);
            }}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
    </div>
  );
};
