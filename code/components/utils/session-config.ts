type WeaveSessionConfig = {
  grid: {
    enabled: boolean;
    type: "lines" | "dots";
  };
};

const defaultSessionConfig: WeaveSessionConfig = {
  grid: {
    enabled: true,
    type: "lines",
  },
};

export const getSessionConfig = (room: string): WeaveSessionConfig => {
  const configJson = sessionStorage.getItem(`weave.js_${room}_config`);

  if (!configJson) {
    return defaultSessionConfig;
  }

  try {
    return JSON.parse(configJson);
  } catch {
    return defaultSessionConfig;
  }
};

export const setSessionConfig = (room: string, config: WeaveSessionConfig) => {
  sessionStorage.setItem(`weave.js_${room}_config`, JSON.stringify(config));
};
