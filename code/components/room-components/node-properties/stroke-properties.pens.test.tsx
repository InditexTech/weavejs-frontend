// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

let actualAction = "brushTool";
let flag = true;

vi.mock("@inditextech/weave-react", () => ({
  useWeave: (selector: (s: unknown) => unknown) =>
    selector({
      instance: {},
      selection: { node: undefined, nodes: [] },
      actions: { actual: actualAction },
    }),
}));
vi.mock("@/store/store", () => ({
  useCollaborationRoom: (selector: (s: unknown) => unknown) =>
    selector({
      nodeProperties: {
        action: "create",
        createProps: { stroke: "#000000ff", strokeWidth: 1 },
      },
    }),
}));
vi.mock("@/lib/pens-eraser/flag", () => ({
  get PENS_AND_ERASER_ENABLED() {
    return flag;
  },
}));
vi.mock("./pen-section", () => ({
  PenSection: () => <div data-testid="pen-section" />,
}));
vi.mock("../inputs/input-color", () => ({
  InputColor: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock("../inputs/input-number", () => ({
  InputNumber: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock("../inputs/input-select", () => ({ default: () => null }));
vi.mock("../toggle-icon-button", () => ({ ToggleIconButton: () => null }));

import { StrokeProperties } from "./stroke-properties";

describe("StrokeProperties with the pens", () => {
  afterEach(() => {
    cleanup();
    actualAction = "brushTool";
    flag = true;
  });

  it("shows the pen section instead of the brush size and the stroke colour", () => {
    render(<StrokeProperties />);
    expect(screen.getByTestId("pen-section")).toBeTruthy();
    expect(screen.queryByText("Brush size")).toBeNull();
    expect(screen.queryByText("Stroke color (#RGBA)")).toBeNull();
  });

  it("is unchanged when the flag is off", () => {
    flag = false;
    render(<StrokeProperties />);
    expect(screen.getByText("Brush size")).toBeTruthy();
    expect(screen.getByText("Stroke color (#RGBA)")).toBeTruthy();
  });
});
