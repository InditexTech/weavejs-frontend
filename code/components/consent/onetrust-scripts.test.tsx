// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OneTrustScripts } from "./onetrust-scripts";

function render(env: unknown) {
  return renderToStaticMarkup(
    <head>
      <OneTrustScripts env={env} />
      <meta charSet="utf-8" />
    </head>,
  );
}

describe("OneTrustScripts", () => {
  it.each([
    ["dev", "01a212a5-64d4-7234-8198-fe3033eae3b4"],
    ["pro", "01a20d38-4629-711e-afd3-95befbf4127e"],
  ])("renders scripts in order first in head for %s", (env, id) => {
    const html = render(env);
    expect(html.startsWith("<head><script")).toBe(true);
    const a = html.indexOf(`consent/${id}/OtAutoBlock.js`);
    const b = html.indexOf("otSDKStub.js");
    const c = html.indexOf("OptanonWrapper");
    const d = html.indexOf("<meta");
    expect(a).toBeGreaterThan(-1);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(c).toBeLessThan(d);
    expect(html).toContain(`data-domain-script="${id}"`);
  });

  it.each([undefined, "", "staging"])("renders nothing for %s", (env) => {
    expect(render(env)).toBe('<head><meta charSet="utf-8"/></head>');
  });
});
