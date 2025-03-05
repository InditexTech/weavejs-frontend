"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ToggleIconButtonKind = "toggle" | "switch";

interface ToggleIconButtonCommonProps {
  kind: ToggleIconButtonKind;
  onClick: () => void;
  pressed: boolean;
  disabled?: boolean;
}

type ToggleIconButtonToggleProps = ToggleIconButtonCommonProps & {
  kind: "toggle";
  icon: React.ReactNode;
  pressedIcon: React.ReactNode;
};

type ToggleIconButtonSwitchProps = ToggleIconButtonCommonProps & {
  kind: "switch";
  icon: React.ReactNode;
  pressedIcon?: never;
};

type ToggleIconButtonProps = ToggleIconButtonToggleProps | ToggleIconButtonSwitchProps;

export const ToggleIconButton = (props: Readonly<ToggleIconButtonProps>) => {
  const { kind, onClick, pressed, disabled, icon, pressedIcon } = props;

  const [isPressed, setIsPressed] = React.useState<boolean>(pressed);

  React.useEffect(() => {
    setIsPressed(pressed);
  }, [pressed]);

  return (
    <button
      className={cn(
        "flex items-center justify-center cursor-pointer",
        "transition-all duration-200 ease-in-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          ["p-[3px] rounded border border-gray-50"]: kind === "switch",
          ["bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border hover:border-gray-900"]: (kind === "switch" && !isPressed) || kind === "toggle",
          ["bg-gray-200 border border-gray-500 hover:bg-gray-300"]: kind === "switch" && isPressed,
        },
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {kind === "toggle" && (isPressed ? pressedIcon : icon)}
      {kind === "switch" && icon}
    </button>
  );
};
