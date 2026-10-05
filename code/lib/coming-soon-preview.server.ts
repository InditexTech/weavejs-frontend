// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

function getSecret(): string | undefined {
  const secret = process.env.COMING_SOON_BYPASS_KEY;
  return secret && secret.length > 0 ? secret : undefined;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function checkKey(key: string): boolean {
  const secret = getSecret();
  return !!secret && safeEqual(key, secret);
}

export function issueToken(now = Date.now()): string | undefined {
  const secret = getSecret();
  if (!secret) return undefined;
  const payload = String(now + TOKEN_TTL_MS);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token: string, now = Date.now()): boolean {
  const secret = getSecret();
  if (!secret) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload, secret))) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > now;
}
