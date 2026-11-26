// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getOneTrustConfig } from "../../lib/onetrust";

export function OneTrustScripts({ env }: Readonly<{ env: unknown }>) {
  const config = getOneTrustConfig(env);
  if (!config) return null;

  return (
    <>
      <script
        type="text/javascript"
        src={config.autoBlockSrc}
        suppressHydrationWarning
      />
      <script
        src={config.sdkStubSrc}
        type="text/javascript"
        charSet="UTF-8"
        data-domain-script={config.domainId}
        suppressHydrationWarning
      />
      <script
        type="text/javascript"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: "function OptanonWrapper() { }" }}
      />
    </>
  );
}
