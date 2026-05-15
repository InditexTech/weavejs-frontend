// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { toast } from "sonner";
import React from "react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { SidebarSelector } from "../sidebar-selector";
import { SidebarHeader } from "../sidebar-header";
import { cn } from "@/lib/utils";
import { useWeave } from "@inditextech/weave-react";
import {
  Guide,
  WeaveNodesSnappingPlugin,
  WEAVE_NODES_SNAPPING_PLUGIN_KEY,
} from "@inditextech/weave-sdk";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Clipboard, Eye, EyeOff, Trash } from "lucide-react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { GuideItem } from "./guide-item";

type GuidesRenderData = {
  visible: boolean;
  guides: Guide[];
};

export const GuidesLibrary = () => {
  const instance = useWeave((state) => state.instance);

  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const setSelectedGuide = useCollaborationRoom(
    (state) => state.setSelectedGuide,
  );

  const [guides, setGuides] = React.useState<Record<string, GuidesRenderData>>(
    {},
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
  );

  const handleGuidesInitialization = React.useCallback(() => {
    if (!instance) {
      return;
    }

    const snappingManager = instance.getPlugin<WeaveNodesSnappingPlugin>(
      WEAVE_NODES_SNAPPING_PLUGIN_KEY,
    );

    if (!snappingManager) {
      return;
    }

    const customGuides = snappingManager
      .getGuidesManager()
      .getAllCustomGuides();

    const customGuidesVisible = snappingManager
      .getGuidesManager()
      .getAllCustomGuidesVisible();

    const model: Record<string, GuidesRenderData> = {};
    for (const containerId in customGuides) {
      model[containerId] = {
        guides: customGuides[containerId],
        visible: customGuidesVisible[containerId] ?? false,
      };
    }

    setGuides(model);
  }, [instance]);

  const handleSelectedGuidesChange = React.useCallback(
    ({ selectedGuide }: { selectedGuide: Guide | null }) => {
      if (!instance) {
        return;
      }

      setSelectedGuide(selectedGuide);
    },
    [instance, setSelectedGuide],
  );

  const handleGuidesChange = React.useCallback(
    ({
      guides,
      visibility,
    }: {
      guides: Record<string, Guide[]>;
      visibility: Record<string, boolean>;
    }) => {
      if (!instance) {
        return;
      }

      const snappingManager = instance.getPlugin<WeaveNodesSnappingPlugin>(
        WEAVE_NODES_SNAPPING_PLUGIN_KEY,
      );

      if (!snappingManager) {
        return;
      }

      const model: Record<string, GuidesRenderData> = {};
      for (const containerId in guides) {
        model[containerId] = {
          guides: guides[containerId],
          visible: visibility?.[containerId] ?? false,
        };
      }

      setGuides(model);
    },
    [instance],
  );

  const handleGuideSelected = React.useCallback(
    ({ guide }: { guide: Guide | null }) => {
      if (!instance) {
        return;
      }

      if (guide) {
        sidebarToggle(SIDEBAR_ELEMENTS.guides);
      }

      setSelectedGuide(guide);
    },
    [],
  );

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    instance.addEventListener(
      "snappingManager:onInitialized",
      handleGuidesInitialization,
    );
    instance.addEventListener(
      "snappingManager:onCustomGuidesChange",
      handleGuidesChange,
    );
    instance.addEventListener(
      "snappingManager:onCustomGuideSelected",
      handleGuideSelected,
    );
    instance.addEventListener(
      "snappingManager:onCustomGuideSelectedChange",
      handleSelectedGuidesChange,
    );

    return () => {
      instance.removeEventListener(
        "snappingManager:onInitialized",
        handleGuidesInitialization,
      );
      instance.removeEventListener(
        "snappingManager:onCustomGuidesChange",
        handleGuidesChange,
      );
      instance.removeEventListener(
        "snappingManager:onCustomGuideSelected",
        handleGuideSelected,
      );
      instance.addEventListener(
        "snappingManager:onCustomGuideSelectedChange",
        handleSelectedGuidesChange,
      );
    };
  }, [
    instance,
    handleGuidesInitialization,
    handleGuidesChange,
    handleGuideSelected,
    handleSelectedGuidesChange,
  ]);

  const snappingManager = React.useMemo(() => {
    if (!instance) {
      return null;
    }

    return instance.getPlugin<WeaveNodesSnappingPlugin>(
      WEAVE_NODES_SNAPPING_PLUGIN_KEY,
    );
  }, [instance]);

  const guidesToRender = React.useMemo(() => {
    if (!instance) {
      return [];
    }

    if (!snappingManager) {
      return [];
    }

    const guidesLinear = Object.entries(guides).map(
      ([containerId, containerGuides]) => {
        const isVisible = containerGuides.visible;

        const container = instance.getStage().findOne(`#${containerId}`);
        const horizontalGuides = containerGuides.guides.filter(
          (guide) => guide.orientation === "H",
        );
        const verticalGuides = containerGuides.guides.filter(
          (guide) => guide.orientation === "V",
        );
        return {
          isVisible,
          container,
          containerId,
          horizontalGuides,
          verticalGuides,
        };
      },
    );

    guidesLinear.sort((a, b) => {
      if (a.containerId === "mainLayer") return -1;
      if (b.containerId === "mainLayer") return 1;
      return a.containerId.localeCompare(b.containerId);
    });

    return guidesLinear;
  }, [instance, snappingManager, guides]);

  return (
    <>
      <div
        className={cn("w-full h-full", {
          ["hidden pointer-events-none"]:
            sidebarActive !== SIDEBAR_ELEMENTS.guides,
          ["block pointer-events-auto"]:
            sidebarActive === SIDEBAR_ELEMENTS.guides,
        })}
      >
        <SidebarHeader>
          <SidebarSelector title="Guides" />
        </SidebarHeader>
        {guidesToRender.length === 0 && (
          <div className="col-span-1 w-full h-[calc(100%-57px)] flex flex-col justify-center items-center text-sm text-center font-inter font-light p-8">
            <b className="font-normal text-[18px]">No guides created</b>
            <span className="text-[14px]">
              Add a horizontal guide by pressing{" "}
              <KbdGroup>
                <Kbd>G</Kbd>
                <Kbd>H</Kbd>
              </KbdGroup>
              <br />
              or a vertical guide by pressing{" "}
              <KbdGroup>
                <Kbd>G</Kbd>
                <Kbd>V</Kbd>
              </KbdGroup>
            </span>
          </div>
        )}
        {guidesToRender.length > 0 && (
          <ScrollArea className="w-full h-[calc(100%-57px)]">
            <div className="flex flex-col justify-start items-start gap-8 w-full h-full p-[24px]">
              {guidesToRender.map((containerGuides) => {
                return (
                  <div
                    key={containerGuides.containerId}
                    className="w-full bg-light-background-1 flex flex-col justify-start items-start gap-1"
                  >
                    <div className="w-full flex gap-2 justify-between items-center">
                      <div className="flex gap-2 justify-start items-center">
                        <Badge variant="secondary" className="font-mono">
                          {containerGuides.container?.getAttrs().nodeType ??
                            "-"}
                        </Badge>
                        <div className="font-light text-base">
                          {containerGuides.containerId === "mainLayer" &&
                            "Room"}
                          {containerGuides.containerId !== "mainLayer" &&
                            (containerGuides.container?.getAttrs().title ||
                              containerGuides.containerId)}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end items-center">
                        <ToolbarButton
                          icon={
                            containerGuides.isVisible ? (
                              <EyeOff
                                size={20}
                                className="group-disabled:text-[#cccccc]"
                                strokeWidth={1}
                              />
                            ) : (
                              <Eye
                                size={20}
                                className="group-disabled:text-[#cccccc]"
                                strokeWidth={1}
                              />
                            )
                          }
                          onClick={() => {
                            if (!instance) {
                              return;
                            }

                            if (!snappingManager) {
                              return;
                            }

                            snappingManager
                              .getGuidesManager()
                              .toggleCustomGuides(containerGuides.containerId);
                          }}
                          label={
                            containerGuides.isVisible
                              ? "Hide guides"
                              : "Show guides"
                          }
                          size="small"
                          variant="squared"
                          tooltipSideOffset={4}
                          tooltipSide="bottom"
                          tooltipAlign="end"
                        />
                        <ToolbarButton
                          icon={
                            <Clipboard
                              size={20}
                              className="group-disabled:text-[#cccccc]"
                              strokeWidth={1}
                            />
                          }
                          onClick={async () => {
                            if (!snappingManager) {
                              return;
                            }

                            try {
                              await snappingManager.copyContainerGuidesToClipboard(
                                containerGuides.containerId,
                              );
                              toast.success("Guides copied to clipboard");
                            } catch (err) {
                              const e = err as Error;
                              if (e.message === "No guides to copy") {
                                toast.error(
                                  "No guides to copy, please select another container",
                                );
                                return;
                              }
                              if (e.message === "Container not found") {
                                toast.error(
                                  "Container not found, please select another container",
                                );
                                return;
                              }
                              toast.error(
                                "Failed to copy guides to clipboard, please try again",
                              );
                              return;
                            }
                          }}
                          label="copy guides to clipboard"
                          size="small"
                          variant="squared"
                          tooltipSideOffset={4}
                          tooltipSide="bottom"
                          tooltipAlign="end"
                        />
                        <ToolbarButton
                          icon={
                            <Trash
                              size={20}
                              className="group-disabled:text-[#cccccc]"
                              strokeWidth={1}
                            />
                          }
                          onClick={() => {
                            if (!instance) {
                              return;
                            }

                            if (!snappingManager) {
                              return;
                            }

                            const allGuides = snappingManager
                              .getGuidesManager()
                              .getAllCustomGuides();

                            const guides =
                              allGuides[containerGuides.containerId] ?? [];

                            if (guides.length === 0) {
                              toast.error("Container has no guides to delete");
                              return;
                            }

                            for (const guide of guides) {
                              snappingManager
                                .getGuidesManager()
                                .deleteGuide(guide);
                            }

                            toast.success("All container guides deleted");
                          }}
                          label="delete all guides"
                          size="small"
                          variant="squared"
                          tooltipSideOffset={4}
                          tooltipSide="bottom"
                          tooltipAlign="end"
                        />
                      </div>
                    </div>
                    <div className="w-full h-[0.5px] bg-[#c9c9c9] mt-2" />
                    {containerGuides.horizontalGuides.length > 0 && (
                      <>
                        <div className="w-full flex gap-2 justify-between items-center mt-2">
                          <div className="font-sans text-sm">Horizontal</div>
                        </div>
                        <div className="w-full flex flex-col gap-1 justify-start items-start mt-2">
                          {containerGuides.horizontalGuides.map((guide) => {
                            return (
                              <GuideItem key={guide.guideId} guide={guide} />
                            );
                          })}
                        </div>
                      </>
                    )}
                    {containerGuides.verticalGuides.length > 0 && (
                      <>
                        <div className="w-full flex gap-2 justify-between items-center mt-2">
                          <div className="font-sans text-sm">Vertical</div>
                        </div>
                        <div className="w-full flex flex-col gap-1 justify-start items-start mt-2">
                          {containerGuides.verticalGuides.map((guide) => {
                            return (
                              <GuideItem key={guide.guideId} guide={guide} />
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </>
  );
};
