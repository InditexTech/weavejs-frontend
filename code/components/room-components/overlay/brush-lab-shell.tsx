// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { createPortal } from "react-dom";
import { BRUSH_LAB_CSS } from "./brush-lab-styles";

const MAX_Z_INDEX = 2147483647;

/**
 * Floating window for the lab. It is mounted straight on `document.body`
 * inside a shadow root: above the app and the room's own shadow DOM, with its
 * own CSS, free to be dragged anywhere on screen.
 */
export function BrushLabShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mount, setMount] = React.useState<HTMLElement | null>(null);
  const [pos, setPos] = React.useState({ x: 16, y: 16 });
  const [collapsed, setCollapsed] = React.useState(false);
  const drag = React.useRef<{ dx: number; dy: number } | null>(null);

  React.useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("data-brush-lab", "");
    host.style.cssText = `position:fixed;top:0;left:0;width:0;height:0;z-index:${MAX_Z_INDEX};`;
    const root = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = BRUSH_LAB_CSS;
    const container = document.createElement("div");
    root.append(style, container);
    document.body.append(host);
    setMount(container);
    return () => {
      host.remove();
    };
  }, []);

  if (!mount) return null;

  const clamp = (x: number, y: number) => ({
    x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - 80)),
    y: Math.min(Math.max(0, y), Math.max(0, window.innerHeight - 40)),
  });

  return createPortal(
    <div
      className="lab"
      style={{ left: pos.x, top: pos.y }}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      <div
        className="head"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).tagName === "BUTTON") return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        }}
        onPointerMove={(e) => {
          if (drag.current) {
            setPos(
              clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy),
            );
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <span>{title}</span>
        <span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse"
          >
            {collapsed ? "▢" : "–"}
          </button>
          <button onClick={onClose} aria-label="Close">
            ✕
          </button>
        </span>
      </div>
      {!collapsed && children}
    </div>,
    mount,
  );
}
