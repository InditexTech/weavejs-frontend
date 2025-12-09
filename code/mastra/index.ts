import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { getStorage } from "./connectors";
import { imageGeneratorEditorAgent } from "./agents/image-generator-editor-agent";

export const mastra = new Mastra({
  agents: { imageGeneratorEditorAgent },
  storage: getStorage(),
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
