// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export type TunableLike = {
  key: string;
  scope: "profile" | "look";
  path: string[];
  stage: string;
  group: string;
  type: "number" | "boolean" | "enum";
  default: number | boolean | string | null;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  options?: string[];
  nullable?: boolean;
  unit?: string;
  help: string;
  advanced?: boolean;
};

export type ControlSpec = {
  key: string;
  label: string;
  control: "slider" | "switch" | "select";
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  help: string;
  advanced: boolean;
  group: string;
  path: string[];
};

export type ControlGroup = {
  group: string;
  basic: ControlSpec[];
  advanced: ControlSpec[];
};

const humanize = (name: string) => {
  const spaced = name.replace(/([A-Z])/g, " $1").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** One control for one setting. Every setting gets one. */
export function controlFor(t: TunableLike): ControlSpec {
  const control =
    t.type === "boolean" ? "switch" : t.type === "enum" ? "select" : "slider";

  const base = {
    key: t.key,
    label: humanize(t.path[t.path.length - 1] ?? t.key),
    control,
    unit: t.unit,
    help: t.help,
    advanced: t.advanced === true,
    group: t.group,
    path: t.path,
  } as const;

  if (control === "slider") {
    const min = t.min ?? 0;
    const max = t.max ?? Math.max(1, min + 1);
    return {
      ...base,
      min,
      max,
      step: t.step ?? (t.integer ? 1 : (max - min) / 100),
    };
  }
  if (control === "select") {
    return { ...base, options: t.options ?? [] };
  }
  return { ...base };
}

/** Groups the settings under their headings, basic ones first. */
export function buildControlGroups(tunables: TunableLike[]): ControlGroup[] {
  const groups = new Map<string, ControlGroup>();
  for (const t of tunables) {
    let g = groups.get(t.group);
    if (!g) {
      g = { group: t.group, basic: [], advanced: [] };
      groups.set(t.group, g);
    }
    const spec = controlFor(t);
    (spec.advanced ? g.advanced : g.basic).push(spec);
  }
  return [...groups.values()];
}

export function getAtPath(source: unknown, path: string[]): unknown {
  let cursor = source;
  for (const part of path) {
    if (cursor === null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

/** The nested object that changes one setting, for the SDK setters. */
export function patchFor(
  path: string[],
  value: unknown,
): Record<string, unknown> {
  return path.reduceRight<Record<string, unknown>>(
    (inner, part, i) =>
      i === path.length - 1 ? { [part]: value } : { [part]: inner },
    {},
  );
}
