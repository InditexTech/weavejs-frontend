"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ToggleIconButtonKind = "toggle" | "switch";

interface ToggleIconButtonCommonProps {
  kind: ToggleIconButtonKind;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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

type ToggleIconButtonProps =
  | ToggleIconButtonToggleProps
  | ToggleIconButtonSwitchProps;

export const ToggleIconButton = (props: Readonly<ToggleIconButtonProps>) => {
  const { kind, onClick, pressed, disabled, icon, pressedIcon } = props;

  const [isPressed, setIsPressed] = React.useState<boolean>(pressed);

  React.useEffect(() => {
    setIsPressed(pressed);
  }, [pressed]);

  return (
    <button
      className={cn(
        "flex items-center justify-center cursor-pointer p-1",
        "transition-all duration-200 ease-in-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          ["p-1"]: kind === "switch",
          ["bg-white hover:bg-accent"]:
            (kind === "switch" && !isPressed) || kind === "toggle",
          ["bg-zinc-700 text-white"]: kind === "switch" && isPressed,
        }
      )}
      disabled={disabled}
      onClick={(e) => onClick?.(e)}
    >
      {kind === "toggle" && (isPressed ? pressedIcon : icon)}
      {kind === "switch" && icon}
    </button>
  );
};
