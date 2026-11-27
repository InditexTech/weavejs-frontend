// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Markdown } from "./markdown";

afterEach(cleanup);

describe("Markdown", () => {
  it("renders headings, lists and tables", () => {
    const { container } = render(
      <Markdown>{"# T\n\n- a\n- b\n\n| h |\n| - |\n| c |"}</Markdown>,
    );
    expect(screen.getByRole("heading", { name: "T" })).toBeTruthy();
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("table")).toBeTruthy();
  });

  it("does not render raw HTML", () => {
    const { container } = render(
      <Markdown>{"<script>x()</script><b>hi</b>"}</Markdown>,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
  });

  it("opens external links safely", () => {
    render(<Markdown>{"[x](https://example.com)"}</Markdown>);
    const a = screen.getByRole("link", { name: "x" });
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  });
});
