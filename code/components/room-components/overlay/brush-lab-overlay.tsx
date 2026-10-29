// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import {
  BRUSH_INPUT_PROFILE_KEYS,
  BRUSH_LOOK_PRESETS,
  BRUSH_LOOK_TUNABLES,
  BRUSH_PROFILE_PRESETS,
  BRUSH_PROFILE_TUNABLES,
  BRUSH_SCENARIOS,
  WEAVE_STROKE_LEGACY_LOOK,
  resolveBrushProfilePatch,
  type WeaveBrushInputProfileKey,
  type WeaveBrushToolAction,
  type WeaveStrokeNode,
} from "@inditextech/weave-sdk";
import type {
  WeaveBrushLabDeviceReport,
  WeaveBrushLabMetrics,
  WeaveBrushLabOverlays,
  WeaveBrushLabPlugin,
} from "@inditextech/weave-sdk/lab";
import { useCollaborationRoom } from "@/store/store";
import { BrushLabShell } from "./brush-lab-shell";
import {
  buildControlGroups,
  getAtPath,
  patchFor,
  type ControlSpec,
  type TunableLike,
} from "@/lib/brush-lab/controls";
import { isBrushLabRequested } from "@/lib/brush-lab/flag";
import {
  clearBrushLabConfig,
  loadBrushLabConfig,
  saveBrushLabConfig,
} from "@/lib/brush-lab/storage";

const BRUSH_TOOL = "brushTool";
const LAB_PLUGIN = "brushLab";

type Handles = {
  tool: WeaveBrushToolAction;
  stroke: WeaveStrokeNode | undefined;
  lab: WeaveBrushLabPlugin | undefined;
};

function useHandles(): Handles | null {
  const instance = useWeave((state) => state.instance);
  return React.useMemo(() => {
    if (!instance) return null;
    const tool = instance.getActionHandler<WeaveBrushToolAction>(BRUSH_TOOL);
    if (!tool) return null;
    return {
      tool,
      stroke: instance.getNodeHandler<WeaveStrokeNode>("stroke"),
      lab: instance.getPlugin<WeaveBrushLabPlugin>(LAB_PLUGIN),
    };
  }, [instance]);
}

/**
 * Mounted while the lab is enabled: restores the saved configuration once the
 * room is ready and opens the panel when the address says `?lab=brush`.
 */
export function BrushLabBoot() {
  const handles = useHandles();
  const setBrushLabShow = useCollaborationRoom((s) => s.setBrushLabShow);
  const restored = React.useRef(false);

  React.useEffect(() => {
    if (!handles || restored.current) return;
    restored.current = true;
    const saved = loadBrushLabConfig();
    if (saved) {
      const result = handles.tool.importConfig(saved);
      if (!result.applied) clearBrushLabConfig();
    }
    if (isBrushLabRequested(window.location.search)) setBrushLabShow(true);
  }, [handles, setBrushLabShow]);

  return null;
}

function Control({
  spec,
  value,
  onChange,
}: {
  spec: ControlSpec;
  value: unknown;
  onChange: (value: number | boolean | string) => void;
}) {
  const label = `${spec.label}${spec.unit ? ` (${spec.unit})` : ""}`;
  return (
    <div className="group" title={spec.help}>
      <div className="row">
        <span>{label}</span>
        {spec.control === "switch" && (
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
        )}
        {spec.control === "slider" && (
          <span className="value">
            {typeof value === "number" ? Math.round(value * 1000) / 1000 : "-"}
          </span>
        )}
        {spec.control === "select" && (
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {spec.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
      </div>
      {spec.control === "slider" && (
        <input
          type="range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={typeof value === "number" ? value : (spec.min ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </div>
  );
}

function ControlGroups({
  groups,
  read,
  write,
}: {
  groups: ReturnType<typeof buildControlGroups>;
  read: (path: string[]) => unknown;
  write: (path: string[], value: number | boolean | string) => void;
}) {
  return (
    <>
      {groups.map((g) => (
        <div key={g.group} className="group">
          <div className="title">{g.group}</div>
          {g.basic.map((c) => (
            <Control
              key={c.key}
              spec={c}
              value={read(c.path)}
              onChange={(v) => write(c.path, v)}
            />
          ))}
          {g.advanced.length > 0 && (
            <details>
              <summary>Advanced</summary>
              {g.advanced.map((c) => (
                <Control
                  key={c.key}
                  spec={c}
                  value={read(c.path)}
                  onChange={(v) => write(c.path, v)}
                />
              ))}
            </details>
          )}
        </div>
      ))}
    </>
  );
}

function Btn({
  on,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return (
    <button className="b" aria-pressed={on} {...rest}>
      {children}
    </button>
  );
}

type Tab = "try" | "device" | "advanced";
type Section = "profile" | "look" | "ghosts" | "config";

export function BrushLabOverlay() {
  const handles = useHandles();
  const instance = useWeave((state) => state.instance);
  const show = useCollaborationRoom((s) => s.brushLab.show);
  const setBrushLabShow = useCollaborationRoom((s) => s.setBrushLabShow);

  const [tab, setTab] = React.useState<Tab>("try");
  const [section, setSection] = React.useState<Section>("profile");
  const [profileKey, setProfileKey] =
    React.useState<WeaveBrushInputProfileKey>("pen.desktop");
  const [, setVersion] = React.useState(0);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [preview, setPreview] = React.useState(false);
  const [overlays, setOverlays] = React.useState<WeaveBrushLabOverlays>({
    raw: false,
    stabilized: false,
    final: false,
    pressure: false,
  });
  const [ghosts, setGhosts] = React.useState<string[]>([]);
  const [importText, setImportText] = React.useState("");
  const [report, setReport] = React.useState<WeaveBrushLabDeviceReport | null>(
    null,
  );
  const [metrics, setMetrics] = React.useState<WeaveBrushLabMetrics | null>(
    null,
  );

  const profileGroups = React.useMemo(
    () => buildControlGroups(BRUSH_PROFILE_TUNABLES as TunableLike[]),
    [],
  );
  const lookGroups = React.useMemo(
    () => buildControlGroups(BRUSH_LOOK_TUNABLES as TunableLike[]),
    [],
  );

  const refresh = React.useCallback(() => setVersion((v) => v + 1), []);

  // Only the configuration is saved; never a stroke or a sample.
  const persist = React.useCallback(() => {
    if (!handles) return;
    saveBrushLabConfig(handles.tool.exportConfigJson());
    refresh();
  }, [handles, refresh]);

  React.useEffect(() => {
    if (!instance || !show) return;
    const onMetrics = (m: WeaveBrushLabMetrics) => setMetrics(m);
    instance.addEventListener("onBrushLabMetrics", onMetrics);
    const timer = setInterval(
      () => setReport(handles?.lab?.getDeviceReport() ?? null),
      500,
    );
    return () => {
      instance.removeEventListener("onBrushLabMetrics", onMetrics);
      clearInterval(timer);
    };
  }, [instance, show, handles]);

  if (!show || !handles) return null;
  const { tool, stroke, lab } = handles;

  const apply = (result: { applied: boolean; errors: string[] }) => {
    setErrors(result.applied ? [] : result.errors);
    if (result.applied) persist();
  };

  const look = tool.getLook() ?? WEAVE_STROKE_LEGACY_LOOK;
  const profile = tool.getInputProfile(profileKey);

  return (
    <BrushLabShell title="Brush Lab" onClose={() => setBrushLabShow(false)}>
      {errors.length > 0 && (
        <div className="err">
          {errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      )}
      <div className="body">
        <div className="tabs" role="tablist">
          {(["try", "device", "advanced"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "try" && (
          <>
            <div className="title">Scenario</div>
            <div className="btns">
              {BRUSH_SCENARIOS.map((s) => (
                <Btn
                  key={s.id}
                  on={tool.getScenarioId() === s.id}
                  title={s.description}
                  onClick={() => apply(tool.applyScenario(s.id))}
                >
                  {s.id}
                </Btn>
              ))}
            </div>
            <div className="value">
              {BRUSH_SCENARIOS.find((s) => s.id === tool.getScenarioId())
                ?.label ?? "Custom"}
            </div>

            <div className="title">Show on canvas</div>
            <div className="btns">
              {(Object.keys(overlays) as (keyof WeaveBrushLabOverlays)[]).map(
                (name) => (
                  <Btn
                    key={name}
                    on={overlays[name]}
                    onClick={() => {
                      lab?.setOverlay(name, !overlays[name]);
                      setOverlays({ ...overlays, [name]: !overlays[name] });
                    }}
                  >
                    {name}
                  </Btn>
                ),
              )}
            </div>
            <div className="title">Report</div>
            <div className="value">
              {report?.pointerType ?? "no pointer yet"}
              {report?.resolvedProfile ? ` · ${report.resolvedProfile}` : ""}
            </div>
            <Btn
              onClick={() =>
                navigator.clipboard?.writeText(
                  JSON.stringify(
                    {
                      config: JSON.parse(tool.exportConfigJson()),
                      device: report,
                      lastStroke: metrics,
                    },
                    null,
                    2,
                  ),
                )
              }
            >
              Copy report
            </Btn>
          </>
        )}

        {tab === "advanced" && (
          <>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as Section)}
            >
              <option value="profile">Profile settings</option>
              <option value="look">Look settings</option>
              <option value="ghosts">Ghosts</option>
              <option value="config">Config and profile</option>
            </select>
            {section === "profile" && (
              <>
                <div className="btns">
                  {BRUSH_INPUT_PROFILE_KEYS.map((k) => (
                    <Btn
                      key={k}
                      on={profileKey === k}
                      onClick={() => setProfileKey(k)}
                    >
                      {k}
                    </Btn>
                  ))}
                </div>
                <div className="btns">
                  {BRUSH_PROFILE_PRESETS[profileKey].map((p) => (
                    <Btn
                      key={p.id}
                      on={tool.getPresetId(profileKey) === p.id}
                      title={p.description}
                      onClick={() =>
                        apply(
                          tool.setInputProfile(
                            profileKey,
                            resolveBrushProfilePatch(p.patch),
                          ),
                        )
                      }
                    >
                      {p.label}
                    </Btn>
                  ))}
                </div>
                <ControlGroups
                  groups={profileGroups}
                  read={(path) => getAtPath(profile, path)}
                  write={(path, value) =>
                    apply(
                      tool.setInputProfile(profileKey, patchFor(path, value)),
                    )
                  }
                />
              </>
            )}
            {section === "look" && (
              <>
                <div className="btns">
                  {BRUSH_LOOK_PRESETS.map((p) => (
                    <Btn
                      key={p.id}
                      title={p.description}
                      onClick={() => apply(tool.setLook(p.patch))}
                    >
                      {p.label}
                    </Btn>
                  ))}
                </div>
                <label className="row">
                  <span>Preview on this screen</span>
                  <input
                    type="checkbox"
                    checked={preview}
                    onChange={(e) => {
                      setPreview(e.target.checked);
                      stroke?.setLookPreview(e.target.checked ? look : null);
                    }}
                  />
                </label>
                <ControlGroups
                  groups={lookGroups}
                  read={(path) => getAtPath(look, path)}
                  write={(path, value) => {
                    apply(tool.setLook(patchFor(path, value)));
                    if (preview) stroke?.setLookPreview(tool.getLook());
                  }}
                />
              </>
            )}
            {section === "ghosts" && (
              <>
                <div className="title">
                  Ghosts (last strokes through other presets)
                </div>
                <div className="btns">
                  {BRUSH_PROFILE_PRESETS[profileKey].map((p) => (
                    <Btn
                      key={p.id}
                      on={ghosts.includes(p.id)}
                      onClick={() => {
                        const next = ghosts.includes(p.id)
                          ? ghosts.filter((g) => g !== p.id)
                          : [...ghosts, p.id];
                        setGhosts(next);
                        lab?.showGhosts(next);
                      }}
                    >
                      {p.label}
                    </Btn>
                  ))}
                </div>
                <Btn
                  onClick={() => {
                    lab?.clearGhosts();
                    setGhosts([]);
                  }}
                >
                  Clear ghosts
                </Btn>
              </>
            )}
            {section === "config" && (
              <>
                <div className="title">Force profile</div>
                <select
                  defaultValue="auto"
                  onChange={(e) =>
                    tool.setForcedProfile(
                      e.target.value === "auto"
                        ? null
                        : (e.target.value as WeaveBrushInputProfileKey),
                    )
                  }
                >
                  <option value="auto">Automatic</option>
                  {BRUSH_INPUT_PROFILE_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <div className="title">Configuration</div>
                <Btn
                  onClick={() =>
                    navigator.clipboard?.writeText(tool.exportConfigJson())
                  }
                >
                  Copy config
                </Btn>
                <textarea
                  placeholder="Paste a configuration JSON"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
                <Btn
                  disabled={importText.trim() === ""}
                  onClick={() => apply(tool.importConfig(importText))}
                >
                  Import config
                </Btn>
                <Btn
                  onClick={() => {
                    clearBrushLabConfig();
                    apply(tool.applyScenario("A"));
                  }}
                >
                  Reset to legacy
                </Btn>
              </>
            )}
          </>
        )}

        {tab === "device" && (
          <>
            {report?.warnings.includes("penReportsAsMouse") && (
              <div className="warn">
                The pen reports as a mouse: pressure and tilt arrive, but the
                pointer type says mouse. Check the driver (Windows Ink).
              </div>
            )}
            <pre>
              {JSON.stringify(report, null, 2) ?? "No pointer events yet"}
            </pre>
            <div className="title">Last stroke</div>
            <pre>
              {metrics ? JSON.stringify(metrics, null, 2) : "No stroke yet"}
            </pre>
          </>
        )}
      </div>
    </BrushLabShell>
  );
}
