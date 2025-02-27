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
        "pointer-events-auto cursor-pointer bg-light-background-1 hover:text-light-content-3 disabled:cursor-default disabled:text-light-content-disabled flex justify-center items-center",
        {
          ["p-[3px] rounded"]: kind === "switch",
          ["bg-light-background-1"]: (kind === "switch" && !isPressed) || kind === "toggle",
          ["bg-light-background-3"]: kind === "switch" && isPressed,
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
