// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import {
  BRUSH_INPUT_PROFILE_KEYS,
  BRUSH_SCENARIOS,
  type WeaveBrushToolAction,
} from "@inditextech/weave-sdk";
import type {
  WeaveBrushLabDeviceReport,
  WeaveBrushLabMetrics,
  WeaveBrushLabOverlays,
  WeaveBrushLabPlugin,
} from "@inditextech/weave-sdk/lab";
import { useCollaborationRoom } from "@/store/store";
import { BrushLabShell } from "./brush-lab-shell";
import { isBrushLabRequested } from "@/lib/brush-lab/flag";
import {
  clearBrushLabConfig,
  loadBrushLabConfig,
  loadBrushLabScenario,
  saveBrushLabConfig,
  saveBrushLabScenario,
} from "@/lib/brush-lab/storage";

const BRUSH_TOOL = "brushTool";
const LAB_PLUGIN = "brushLab";

type Handles = {
  tool: WeaveBrushToolAction;
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
    const scenario = loadBrushLabScenario();
    const saved = loadBrushLabConfig();
    if (scenario) {
      handles.tool.applyScenario(scenario);
    } else if (saved) {
      const result = handles.tool.importConfig(saved);
      if (!result.applied) clearBrushLabConfig();
    }
    if (isBrushLabRequested(window.location.search)) setBrushLabShow(true);
  }, [handles, setBrushLabShow]);

  return null;
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

/**
 * Polls the device report on its own, so the rest of the panel (above all its
 * dropdowns) is not re-rendered while the user is choosing: re-rendering a
 * select closes its open list.
 */
function DeviceInfo({
  lab,
}: Readonly<{ lab: WeaveBrushLabPlugin | undefined }>) {
  const [report, setReport] = React.useState<WeaveBrushLabDeviceReport | null>(
    null,
  );

  React.useEffect(() => {
    const timer = setInterval(
      () => setReport(lab?.getDeviceReport() ?? null),
      500,
    );
    return () => clearInterval(timer);
  }, [lab]);

  return (
    <>
      <div className="value">
        {report?.pointerType ?? "no pointer yet"}
        {report?.resolvedProfile ? ` · ${report.resolvedProfile}` : ""}
        {report?.sampleRateHz ? ` · ${Math.round(report.sampleRateHz)} Hz` : ""}
      </div>
      {report?.warnings.includes("penReportsAsMouse") && (
        <div className="warn">
          The pen reports as a mouse. Check the driver (Windows Ink).
        </div>
      )}
    </>
  );
}

export function BrushLabOverlay() {
  const handles = useHandles();
  const instance = useWeave((state) => state.instance);
  const show = useCollaborationRoom((s) => s.brushLab.show);
  const setBrushLabShow = useCollaborationRoom((s) => s.setBrushLabShow);

  const [, refresh] = React.useReducer((v: number) => v + 1, 0);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [compareMessage, setCompareMessage] = React.useState("");
  const [compareId, setCompareId] = React.useState("F");
  const [overlays, setOverlays] = React.useState<WeaveBrushLabOverlays>({
    raw: false,
    stabilized: false,
    final: false,
    pressure: false,
  });
  const [metrics, setMetrics] = React.useState<WeaveBrushLabMetrics | null>(
    null,
  );


  // Only the configuration is saved; never a stroke or a sample.
  const persist = React.useCallback(() => {
    if (!handles) return;
    saveBrushLabConfig(handles.tool.exportConfigJson());
    saveBrushLabScenario(handles.tool.getScenarioId());
    refresh();
  }, [handles, refresh]);

  React.useEffect(() => {
    if (!instance || !show) return;
    const onMetrics = (m: WeaveBrushLabMetrics) => setMetrics(m);
    instance.addEventListener("onBrushLabMetrics", onMetrics);
    return () => {
      instance.removeEventListener("onBrushLabMetrics", onMetrics);
    };
  }, [instance, show]);

  if (!show || !handles) return null;
  const { tool, lab } = handles;

  const apply = (result: { applied: boolean; errors: string[] }) => {
    setErrors(result.applied ? [] : result.errors);
    if (result.applied) persist();
  };

  // A brush that was never changed is the legacy one.
  const untouched =
    BRUSH_INPUT_PROFILE_KEYS.every((k) => tool.getPresetId(k) === "legacy") &&
    tool.getLook() === null;
  const runCompare = (id: string) => {
    if (!lab) {
      setCompareMessage("The lab plugin is not registered");
      return;
    }
    const result = lab.compareLast(id);
    setCompareMessage(result.reason ?? `Red: ${id}. Black: what was drawn.`);
  };

  const current = tool.getScenarioId() ?? (untouched ? "A" : "custom");

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
        <div className="title">Brush</div>
        <select
          value={current}
          onChange={(e) => apply(tool.applyScenario(e.target.value))}
        >
          {current === "custom" && <option value="custom">Custom</option>}
          {BRUSH_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id} title={s.description}>
              {s.label.replace(/^[A-Z]: /, "")}
            </option>
          ))}
        </select>
        <div className="value">
          {BRUSH_SCENARIOS.find((s) => s.id === current)?.description ?? ""}
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

        <div className="title">Compare last stroke (black) with</div>
        <select
          value={compareId}
          onChange={(e) => {
            setCompareId(e.target.value);
            if (compareMessage) runCompare(e.target.value);
          }}
        >
          {BRUSH_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label.replace(/^[A-Z]: /, "")}
            </option>
          ))}
        </select>
        <div className="btns">
          <Btn onClick={() => runCompare(compareId)}>Compare</Btn>
          <Btn
            onClick={() => {
              lab?.clearGhosts();
              setCompareMessage("");
            }}
          >
            Clear
          </Btn>
        </div>
        <div className="value">{compareMessage}</div>

        <div className="title">Device</div>
        <DeviceInfo lab={lab} />

        <Btn
          onClick={() =>
            navigator.clipboard?.writeText(
              JSON.stringify(
                {
                  config: JSON.parse(tool.exportConfigJson()),
                  device: lab?.getDeviceReport() ?? null,
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
      </div>
    </BrushLabShell>
  );
}
