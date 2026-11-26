// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

const ONETRUST_DOMAIN_IDS: Readonly<Record<string, string>> = {
  dev: "01a212a5-64d4-7234-8198-fe3033eae3b4",
  pro: "01a20d38-4629-711e-afd3-95befbf4127e",
};

export type OneTrustConfig = {
  domainId: string;
  autoBlockSrc: string;
  sdkStubSrc: string;
};

export function getOneTrustConfig(env: unknown): OneTrustConfig | undefined {
  if (typeof env !== "string") return undefined;
  if (!Object.prototype.hasOwnProperty.call(ONETRUST_DOMAIN_IDS, env)) {
    return undefined;
  }
  const domainId = ONETRUST_DOMAIN_IDS[env];
  return {
    domainId,
    autoBlockSrc: `https://cdn.cookielaw.org/consent/${domainId}/OtAutoBlock.js`,
    sdkStubSrc: "https://cdn.cookielaw.org/scripttemplates/otSDKStub.js",
  };
}

export function getAppEnv(): string | undefined {
  return import.meta.env.VITE_APP_ENV;
}
