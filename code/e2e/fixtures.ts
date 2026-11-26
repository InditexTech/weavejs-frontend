// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base, expect, type Page } from "@playwright/test";

export { expect };

const ROOM_ID = "e2e-room";
const IMAGE_ID = "e2e-image";
const IMAGE = readFileSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../assets/images/logo-landscape.png",
  ),
);

// The backend is mocked, so the shapes below mirror what the app reads.
async function mockBackend(page: Page) {
  const now = new Date().toISOString();

  await page.route("**/weavebff/**", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;

    if (pathname.endsWith("/auth/get-session")) {
      return route.fulfill({
        json: {
          session: {
            id: "session-1",
            userId: "user-1",
            token: "token",
            expiresAt: new Date(Date.now() + 864e5).toISOString(),
            createdAt: now,
            updatedAt: now,
          },
          user: {
            id: "user-1",
            name: "Tester",
            email: "tester@example.com",
            emailVerified: true,
            image: null,
            createdAt: now,
            updatedAt: now,
          },
        },
      });
    }
    if (pathname.endsWith(`/api/v1/rooms/${ROOM_ID}`)) {
      return route.fulfill({
        json: { room: { id: ROOM_ID, name: "E2E room" }, status: "active" },
      });
    }
    if (pathname.endsWith(`/standalone/${ROOM_ID}/images`)) {
      return route.fulfill({ json: { images: [IMAGE_ID] } });
    }
    if (pathname.endsWith(`/images/${IMAGE_ID}/threads`)) {
      return route.fulfill({ json: { items: [], total: 0 } });
    }
    if (pathname.endsWith(`/images/${IMAGE_ID}/data`)) {
      return route.fulfill({ json: { data: undefined } });
    }
    if (pathname.endsWith(`/images/${IMAGE_ID}`)) {
      return route.fulfill({ body: IMAGE, contentType: "image/png" });
    }
    return route.fulfill({ status: 404, json: {} });
  });
}

async function openImage(page: Page) {
  await page.goto(`/use-cases/standalone/${ROOM_ID}`);
  await page.getByAltText(`image ${IMAGE_ID} thumbnail`).click();
  await expect(
    page.locator("button:has(svg.lucide-brush)").first(),
  ).toBeVisible({
    timeout: 30_000,
  });
}

export const test = base.extend<{ canvas: Page }>({
  canvas: async ({ page }, provide) => {
    await mockBackend(page);
    await openImage(page);
    await provide(page);
  },
});
