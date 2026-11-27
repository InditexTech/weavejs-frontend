// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth.client";
import { ShowcaseUserMenu } from "./showcase.user-menu";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/auth.client", () => ({
  authClient: { signOut: vi.fn() },
}));

const user = {
  id: "user-123",
  name: "Jane Doe",
  email: "jane@example.com",
  image: null,
};

const openMenu = () =>
  fireEvent.keyDown(screen.getByRole("button", { name: /Jane Doe/ }), {
    key: "Enter",
  });

describe("ShowcaseUserMenu", () => {
  const writeText = vi.fn();

  beforeAll(() => {
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    writeText.mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
    vi.mocked(authClient.signOut).mockReset();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => cleanup());

  it("shows the name and email and never prints the id", () => {
    const { container } = render(
      <ShowcaseUserMenu user={user} showCopyUserId />,
    );
    expect(screen.getAllByText("Jane Doe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("jane@example.com").length).toBeGreaterThan(0);
    openMenu();
    expect(container.innerHTML).not.toContain("user-123");
    expect(document.body.innerHTML).not.toContain("user-123");
  });

  it("copies the user id from the menu", async () => {
    writeText.mockResolvedValue(undefined);
    render(<ShowcaseUserMenu user={user} showCopyUserId />);
    openMenu();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /COPY USER ID/ }),
    );
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith("user-123");
  });

  it("shows an error toast when the clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<ShowcaseUserMenu user={user} showCopyUserId />);
    openMenu();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /COPY USER ID/ }),
    );
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("omits COPY USER ID when not enabled", async () => {
    render(<ShowcaseUserMenu user={user} />);
    openMenu();
    await screen.findByRole("menuitem", { name: /SIGN OUT/ });
    expect(screen.queryByRole("menuitem", { name: /COPY USER ID/ })).toBeNull();
  });

  it("signs out from the menu", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue(undefined as never);
    render(<ShowcaseUserMenu user={user} />);
    openMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: /SIGN OUT/ }));
    await vi.waitFor(() => expect(authClient.signOut).toHaveBeenCalledTimes(1));
  });

  it("shows an error toast when sign out fails", async () => {
    vi.mocked(authClient.signOut).mockRejectedValue(new Error("nope"));
    render(<ShowcaseUserMenu user={user} />);
    openMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: /SIGN OUT/ }));
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
  });
});
