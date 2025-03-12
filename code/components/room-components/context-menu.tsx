"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ContextMenuButtonProps = {
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

export type ContextMenuOption = {
  id: string;
  type: "button" | "divider";
} & (
  | {
      type: "button";
      label: string;
      icon?: React.ReactNode;
      disabled?: boolean;
      onClick: () => void;
    }
  | {
      type: "divider";
    }
);

type ContextMenuProps = {
  show: boolean;
  onChanged: (show: boolean) => void;
  position: { x: number; y: number };
  options: ContextMenuOption[];
};

function ContextMenuButton({
  label,
  icon,
  disabled,
  onClick,
}: Readonly<ContextMenuButtonProps>) {
  return (
    <button
      className={cn(
        "!cursor-pointer w-[calc(100%-8px)] flex justify-start items-center gap-2 font-noto-sans-mono text-sm text-left whitespace-nowrap m-1 text-foreground px-2 py-1.5",
        {
          ["hover:bg-accent"]: !disabled,
          ["!cursor-default hover:bg-white text-muted-foreground"]: disabled,
        }
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon} {label}
    </button>
  );
}

export const ContextMenuRender = ({
  show,
  onChanged,
  position,
  options,
}: Readonly<ContextMenuProps>) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function checkIfClickedOutside(e: MouseEvent) {
      if (ref.current && e.target !== ref.current) {
        ref.current.style.display = `none`;
        onChanged(false);
      }
    }

    window.addEventListener("click", checkIfClickedOutside);

    return () => {
      window.removeEventListener("click", checkIfClickedOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="fixed w-[200px] bg-white flex flex-col border border-zinc-200 shadow-xs"
      style={{
        display: show ? "block" : "none",
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      {options.map((option) => {
        if (option.type === "button") {
          return (
            <ContextMenuButton
              key={option.id}
              label={option.label}
              icon={option.icon}
              disabled={option.disabled ?? false}
              onClick={option.onClick}
            />
          );
        }
        if (option.type === "divider") {
          return (
            <div key={option.id} className="w-full h-[1px] bg-accent"></div>
          );
        }
      })}
    </div>
  );
};
