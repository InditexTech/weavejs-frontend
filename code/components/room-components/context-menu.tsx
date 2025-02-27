"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ContextMenuButtonProps = {
  label: React.ReactNode;
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

function ContextMenuButton({ label, disabled, onClick }: Readonly<ContextMenuButtonProps>) {
  return (
    <button
      className={cn("!cursor-pointer font-body-m-light w-full bg-transparent text-left px-3 py-2", {
        ["hover:bg-light-background-hover"]: !disabled,
        ["!cursor-default"]: disabled,
      })}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export const ContextMenu = ({ show, onChanged, position, options }: Readonly<ContextMenuProps>) => {
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
      className="fixed w-[200px] bg-light-background-1 flex flex-col border border-light-border-1"
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
              disabled={option.disabled ?? false}
              onClick={option.onClick}
            />
          );
        }
        if (option.type === "divider") {
          return <div key={option.id} className="w-full h-[1px] bg-light-background-3"></div>;
        }
      })}
    </div>
  );
};
