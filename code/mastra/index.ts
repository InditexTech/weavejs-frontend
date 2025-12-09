// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { getStorage } from "./connectors";
import { getImageGeneratorEditorAgent } from "./agents/image-generator-editor-agent";

let mastra: Mastra | null = null;

export const getMastra = async () => {
  if (!mastra) {
    // Ensure storage is initialized
    const storage = await getStorage();

    // Ensure agent is initialized
    const imageGeneratorEditorAgent = await getImageGeneratorEditorAgent();

    mastra = new Mastra({
      agents: { imageGeneratorEditorAgent },
      storage,
      logger: new PinoLogger({
        name: "Mastra",
        level: "info",
      }),
      telemetry: {
        // Telemetry is deprecated and will be removed in the Nov 4th release
        enabled: false,
      },
      observability: {
        // Enables DefaultExporter and CloudExporter for AI tracing
        default: { enabled: false },
      },
    });
  }

  return mastra;
};
