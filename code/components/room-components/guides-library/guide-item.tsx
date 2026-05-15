// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";
import {
  Guide,
  WeaveNodesSnappingPlugin,
  WEAVE_NODES_SNAPPING_PLUGIN_KEY,
} from "@inditextech/weave-sdk";
import { useWeave } from "@inditextech/weave-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { X } from "lucide-react";

type GuideItemProps = {
  guide: Guide;
};

export const GuideItem = ({ guide }: Readonly<GuideItemProps>) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [editing, setEditing] = React.useState(false);
  const [actualGuideId, setActualGuideId] = React.useState<string>("");
  const [actualGuideValue, setActualGuideValue] = React.useState<string>("");
  const [inputValue, setInputValue] = React.useState<string>("");

  const instance = useWeave((state) => state.instance);

  const selectedGuide = useCollaborationRoom((state) => state.guides.selected);

  const guideValue = React.useMemo(() => {
    return guide.value === null || guide.value === undefined
      ? ""
      : `${guide.value}`;
  }, [guide.value]);

  React.useEffect(() => {
    if (actualGuideId !== guide.guideId) {
      setInputValue(guideValue);
      setActualGuideValue(guideValue);
      setActualGuideId(guide.guideId);
    }
  }, [guide, actualGuideId, guideValue]);

  React.useEffect(() => {
    if (actualGuideValue !== guideValue) {
      setInputValue(guideValue);
      setActualGuideValue(guideValue);
    }
  }, [guide, actualGuideValue, guideValue]);

  React.useEffect(() => {
    if (selectedGuide?.guideId === actualGuideId) {
      inputRef.current?.focus();
      inputRef.current?.focus();
    }
  }, [actualGuideId, selectedGuide]);

  const snappingManager = React.useMemo(() => {
    if (!instance) {
      return null;
    }

    return instance.getPlugin<WeaveNodesSnappingPlugin>(
      WEAVE_NODES_SNAPPING_PLUGIN_KEY,
    );
  }, [instance]);

  return (
    <div
      key={guide.guideId}
      role="button"
      className="w-full flex gap-5 justify-between items-center cursor-pointer min-h-[26px]"
      onClick={() => {
        if (!snappingManager) {
          return;
        }

        snappingManager.getGuidesManager().selectGuide(guide);
      }}
    >
      <div className="flex justify-start items-center gap-1">
        <div
          className={cn("font-light text-xs", {
            ["underline"]: selectedGuide?.guideId === guide.guideId,
          })}
        >
          {guide.guideId}
        </div>
      </div>
      <div className="flex justify-end items-center gap-2">
        <input
          ref={inputRef}
          className={cn(
            "w-[70px] px-2 py-1 border-[0.5px] border-[#c9c9c9] font-mono text-xs text-right",
            {
              ["!cursor-pointer"]: !editing,
              ["!cursor-text"]: editing,
            },
          )}
          type="text"
          value={inputValue}
          onClick={() => {
            setEditing(true);
          }}
          onBlur={() => {
            setEditing(false);
          }}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (!instance) {
              return;
            }

            if (!snappingManager) {
              return;
            }

            if (e.key === "Enter") {
              setActualGuideValue(inputValue);
              snappingManager.getGuidesManager().editCustomGuide({
                ...guide,
                value: Number(inputValue),
              });

              snappingManager
                .getGuidesManager()
                .renderCustomGuides(guide.containerId);
            }
          }}
          onChange={(e) => {
            if (!instance) {
              return;
            }

            if (!snappingManager) {
              return;
            }

            const value = e.target.value;
            if (/^-?\d*$/.test(value)) {
              setInputValue(value);
            }
          }}
        />
        <ToolbarButton
          icon={
            <X
              size={20}
              className="group-disabled:text-[#cccccc]"
              strokeWidth={1}
            />
          }
          onClick={() => {
            if (!snappingManager) {
              return;
            }

            snappingManager.getGuidesManager().deleteGuide(guide);
          }}
          label="delete guide"
          size="small"
          variant="squared"
          tooltipSideOffset={4}
          tooltipSide="bottom"
          tooltipAlign="end"
        />
      </div>
    </div>
  );
};
