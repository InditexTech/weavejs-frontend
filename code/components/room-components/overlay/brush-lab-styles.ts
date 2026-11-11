// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

/**
 * The lab's own stylesheet. It lives inside a shadow root, so nothing from the
 * app (Tailwind, shadcn, global CSS) reaches it and nothing here leaks out.
 */
export const BRUSH_LAB_CSS = `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }
.lab {
  position: fixed;
  width: 340px;
  max-height: min(480px, calc(100vh - 24px));
  display: flex;
  flex-direction: column;
  background: #fff;
  color: #111;
  border: 1px solid #bbb;
  box-shadow: 0 8px 30px rgba(0,0,0,.25);
  font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}
.head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; background: #111; color: #fff;
  cursor: grab; touch-action: none; text-transform: uppercase; letter-spacing: .04em;
}
.head:active { cursor: grabbing; }
.head button { background: none; border: 0; color: #fff; font-size: 16px; min-width: 32px; min-height: 32px; cursor: pointer; }
.body { overflow-y: auto; min-height: 0; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
.tabs { display: flex; gap: 2px; }
.tabs button { flex: 1; min-height: 36px; border: 1px solid #ccc; background: #f4f4f4; cursor: pointer; font: inherit; }
.tabs button[aria-selected="true"] { background: #111; color: #fff; border-color: #111; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 32px; }
.group { display: flex; flex-direction: column; gap: 2px; }
.title { font-size: 10px; text-transform: uppercase; color: #666; padding-top: 6px; }
.value { color: #666; font-variant-numeric: tabular-nums; }
.btns { display: flex; flex-wrap: wrap; gap: 4px; }
button.b { min-height: 44px; padding: 0 12px; border: 1px solid #111; background: #fff; color: #111; cursor: pointer; font: inherit; text-transform: uppercase; }
button.b[aria-pressed="true"] { background: #111; color: #fff; }
button.b:disabled { opacity: .4; cursor: default; }
input[type="range"] { width: 100%; min-height: 28px; margin: 0; }
input[type="checkbox"] { width: 22px; height: 22px; }
select, textarea { font: inherit; border: 1px solid #bbb; background: #fff; color: #111; padding: 6px; min-height: 36px; }
textarea { width: 100%; height: 80px; font-family: ui-monospace, Menlo, monospace; font-size: 11px; user-select: text; }
details summary { cursor: pointer; color: #666; min-height: 32px; display: flex; align-items: center; }
pre { margin: 0; white-space: pre-wrap; font-size: 11px; user-select: text; }
.err { color: #b91c1c; padding: 8px 10px; border-bottom: 1px solid #ddd; }
.warn { border: 1px solid #d97706; color: #b45309; padding: 6px; }
`;
