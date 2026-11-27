// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, renderHook } from "@testing-library/react";

vi.mock("@inditextech/weave-sdk", () => ({
  STROKE_ERASER_TOOL_ACTION_NAME: "strokeEraserTool",
}));

import { useStrokeEraserHotkey } from "./use-stroke-eraser-hotkey";

function press(init: KeyboardEventInit) {
  fireEvent.keyDown(document, init);
  fireEvent.keyUp(document, init);
}

describe("useStrokeEraserHotkey", () => {
  afterEach(() => cleanup());

  it("triggers the stroke eraser on Shift+D", () => {
    const trigger = vi.fn();
    renderHook(() =>
      useStrokeEraserHotkey(trigger, { enabled: true, flagEnabled: true }),
    );
    press({ key: "D", code: "KeyD", shiftKey: true });
    expect(trigger).toHaveBeenCalledWith("strokeEraserTool");
  });

  it("does not react to D alone, which stays the node eraser", () => {
    const trigger = vi.fn();
    renderHook(() =>
      useStrokeEraserHotkey(trigger, { enabled: true, flagEnabled: true }),
    );
    press({ key: "d", code: "KeyD" });
    expect(trigger).not.toHaveBeenCalled();
  });

  it("does nothing when the flag is off", () => {
    const trigger = vi.fn();
    renderHook(() =>
      useStrokeEraserHotkey(trigger, { enabled: true, flagEnabled: false }),
    );
    press({ key: "D", code: "KeyD", shiftKey: true });
    expect(trigger).not.toHaveBeenCalled();
  });

  it("does nothing while keys are disabled", () => {
    const trigger = vi.fn();
    renderHook(() =>
      useStrokeEraserHotkey(trigger, { enabled: false, flagEnabled: true }),
    );
    press({ key: "D", code: "KeyD", shiftKey: true });
    expect(trigger).not.toHaveBeenCalled();
  });
});
