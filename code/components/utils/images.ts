// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { postExportToImage } from "@/api/post-export-to-image";
import type { Weave } from "@inditextech/weave-sdk";
import { WeaveExportNodesOptions } from "@inditextech/weave-types";

export const getImageBase64 = async ({
  instance,
  nodes,
  options,
}: {
  instance: Weave;
  nodes: string[];
  options: WeaveExportNodesOptions;
}): Promise<{ url: string }> => {
  const snapshot: Uint8Array<ArrayBufferLike> = instance
    .getStore()
    .getStateSnapshot();

  const data: { url: string } = await postExportToImage(
    Buffer.from(snapshot).toString("base64"),
    nodes,
    options,
    "base64"
  );

  return data;
};

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string); // Data URL string
    reader.onerror = reject;

    reader.readAsDataURL(file); // <--- this converts File → data URL
  });
}
