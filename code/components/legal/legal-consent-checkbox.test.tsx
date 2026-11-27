// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LegalConsentCheckbox } from "./legal-consent-checkbox";

function Harness() {
  const [accepted, setAccepted] = React.useState(false);
  return (
    <>
      <LegalConsentCheckbox checked={accepted} onCheckedChange={setAccepted} />
      <button disabled={!accepted}>login</button>
    </>
  );
}

afterEach(cleanup);

describe("LegalConsentCheckbox", () => {
  it("is unchecked by default and enables login when checked", () => {
    render(<Harness />);
    const button = screen.getByRole("button", {
      name: "login",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(button.disabled).toBe(false);
  });

  it("links to the terms and privacy pages in a new tab", () => {
    render(<Harness />);
    const links = [
      ["Terms and Conditions", "/legal-notice"],
      ["Privacy Policy", "/privacy-policy"],
    ];
    for (const [name, href] of links) {
      const a = screen.getByRole("link", { name });
      expect(a.getAttribute("href")).toBe(href);
      expect(a.getAttribute("target")).toBe("_blank");
    }
  });
});
