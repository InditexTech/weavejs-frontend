// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { ShowcaseUserId } from "./showcase.user-id";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ShowcaseUserId", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => cleanup());

  it("renders the user id", () => {
    render(<ShowcaseUserId userId="user-123" />);
    expect(screen.getByText("user-123")).toBeTruthy();
  });

  it("copies the id and shows a success toast", async () => {
    writeText.mockResolvedValue(undefined);
    render(<ShowcaseUserId userId="user-123" />);
    fireEvent.click(screen.getByLabelText("Copy user ID"));
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith("user-123");
  });

  it("shows an error toast when the clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<ShowcaseUserId userId="user-123" />);
    fireEvent.click(screen.getByLabelText("Copy user ID"));
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.success).not.toHaveBeenCalled();
  });
});
