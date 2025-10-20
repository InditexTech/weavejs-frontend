// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { ToggleIconButton } from "../toggle-icon-button";
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from "lucide-react";
import {
  WeaveAlignNodesToolAction,
  WeaveAlignNodesToolActionTriggerParams,
} from "@inditextech/weave-sdk/client";

export function AlignProperties() {
  const [canAlign, setCanAlign] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const nodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  React.useEffect(() => {
    if (!instance) return;

    if (nodes) {
      const alignNodesTool =
        instance.getActionHandler<WeaveAlignNodesToolAction>("alignNodesTool");
      if (alignNodesTool) {
        setCanAlign(alignNodesTool.canAlignSelectedNodes());
      }
    }
  }, [instance, nodes]);

  if (!instance || !actualAction || !nodes || (nodes && nodes.length < 2))
    return null;

  return (
    <div className="border-b border-b-[0.5px] border-[#c9c9c9] p-[24px] flex flex-col gap-[16px]">
      <div className="w-full flex justify-between items-center gap-3">
        <div className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-[13px] font-inter font-light uppercase">
            Alignment
          </span>
        </div>
      </div>
      <div className="w-full grid grid-cols-2 gap-3 justify-center items-center">
        <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
          Horizontally
        </div>
        <div className="flex gap-1 justify-end items-center">
          <ToggleIconButton
            kind="switch"
            pressed={false}
            disabled={!canAlign}
            icon={<AlignHorizontalJustifyStart size={20} strokeWidth={1} />}
            onClick={() => {
              if (!instance) {
                return;
              }

              instance.triggerAction<
                WeaveAlignNodesToolActionTriggerParams,
                void
              >("alignNodesTool", {
                alignTo: "left-horizontal",
              });
            }}
          />
          <ToggleIconButton
            kind="switch"
            pressed={false}
            disabled={!canAlign}
            icon={<AlignHorizontalJustifyCenter size={20} strokeWidth={1} />}
            onClick={() => {
              if (!instance) {
                return;
              }

              instance.triggerAction<
                WeaveAlignNodesToolActionTriggerParams,
                void
              >("alignNodesTool", {
                alignTo: "center-horizontal",
              });
            }}
          />
          <ToggleIconButton
            kind="switch"
            pressed={false}
            disabled={!canAlign}
            icon={<AlignHorizontalJustifyEnd size={20} strokeWidth={1} />}
            onClick={() => {
              if (!instance) {
                return;
              }

              instance.triggerAction<
                WeaveAlignNodesToolActionTriggerParams,
                void
              >("alignNodesTool", {
                alignTo: "right-horizontal",
              });
            }}
          />
        </div>
        <div className="text-[12px] text-[#757575] font-inter font-light text-nowrap">
          Vertically
        </div>
        <div className="flex gap-1 justify-end items-center">
          <ToggleIconButton
            kind="switch"
            pressed={false}
            disabled={!canAlign}
            icon={<AlignVerticalJustifyStart size={20} strokeWidth={1} />}
            onClick={() => {
              if (!instance) {
                return;
              }

              instance.triggerAction<
                WeaveAlignNodesToolActionTriggerParams,
                void
              >("alignNodesTool", {
                alignTo: "top-vertical",
              });
            }}
          />
          <ToggleIconButton
            kind="switch"
            pressed={false}
            disabled={!canAlign}
            icon={<AlignVerticalJustifyCenter size={20} strokeWidth={1} />}
            onClick={() => {
              if (!instance) {
                return;
              }

              instance.triggerAction<
                WeaveAlignNodesToolActionTriggerParams,
                void
              >("alignNodesTool", {
                alignTo: "center-vertical",
              });
            }}
          />
          <ToggleIconButton
            kind="switch"
            pressed={false}
            disabled={!canAlign}
            icon={<AlignVerticalJustifyEnd size={20} strokeWidth={1} />}
            onClick={() => {
              if (!instance) {
                return;
              }

              instance.triggerAction<
                WeaveAlignNodesToolActionTriggerParams,
                void
              >("alignNodesTool", {
                alignTo: "bottom-vertical",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
