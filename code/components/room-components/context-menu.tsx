// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";

type ContextMenuButtonProps = {
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export type ContextMenuOption = {
  id: string;
  type: "button" | "divider";
} & (
  | {
      type: "button";
      label: string | React.ReactNode;
      icon?: React.ReactNode;
      disabled?: boolean;
      onClick: (
        e?: React.MouseEvent<HTMLButtonElement>
      ) => void | Promise<void>;
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
        "!cursor-pointer w-[calc(100%-8px)] flex justify-between items-center gap-2 font-inter text-sm text-left whitespace-nowrap m-1 text-foreground px-2 py-1.5",
        {
          ["hover:bg-accent"]: !disabled,
          ["!cursor-default hover:bg-white text-muted-foreground"]: disabled,
        }
      )}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {icon} <div className="w-full">{label}</div>
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

  const instance = useWeave((state) => state.instance);

  React.useEffect(() => {
    if (ref.current && show) {
      const boundingRect = ref.current.getBoundingClientRect();
      let X = boundingRect.x;
      let Y = boundingRect.y;

      X = Math.max(
        20,
        Math.min(X, window.innerWidth - boundingRect.width - 20)
      );
      Y = Math.max(
        20,
        Math.min(Y, window.innerHeight - boundingRect.height - 20)
      );

      ref.current.style.top = `${Y}px`;
      ref.current.style.left = `${X}px`;
    }
  }, [show]);

  React.useEffect(() => {
    function checkIfClickedOutside(e: PointerEvent) {
      if (!ref.current) {
        return;
      }

      if (
        ref.current &&
        e.target !== ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        ref.current.click();
        ref.current.style.display = `none`;
        ref.current.style.pointerEvents = `none`;
        onChanged(false);
      }
    }

    if (instance) {
      instance
        .getStage()
        .container()
        .addEventListener("pointerdown", checkIfClickedOutside);
    }

    return () => {
      if (instance) {
        instance
          .getStage()
          .container()
          .removeEventListener("pointerdown", checkIfClickedOutside);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  return (
    <div
      ref={ref}
      className="fixed w-[300px] bg-white flex flex-col border border-[#c9c9c9] shadow-none"
      style={{
        pointerEvents: show && options.length > 0 ? "auto" : "none",
        display: show && options.length > 0 ? "block" : "none",
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 10,
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
