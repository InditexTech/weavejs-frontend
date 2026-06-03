// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Pickaxe, Presentation } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { Divider } from "../overlay/divider";
import { useIsRoomReady } from "../hooks/use-is-room-ready";
import { useBuildPresentation } from "../hooks/use-build-presentation";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { getAllPages } from "@/api/pages/get-all-pages";

export const PresentationToolbar = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const roomId = useCollaborationRoom((state) => state.room);
  const presentationStatus = useCollaborationRoom(
    (state) => state.presentation.status,
  );
  const setPresentationStatus = useCollaborationRoom(
    (state) => state.setPresentationStatus,
  );
  const setPresentationInstanceId = useCollaborationRoom(
    (state) => state.setPresentationInstanceId,
  );
  const setPresentationVisible = useCollaborationRoom(
    (state) => state.setPresentationVisible,
  );

  const { triggerPresentationBuild } = useBuildPresentation();

  const isRoomReady = useIsRoomReady();

  React.useEffect(() => {
    let presentationInstanceId = null;
    if (typeof sessionStorage !== "undefined") {
      try {
        presentationInstanceId = JSON.parse(
          sessionStorage.getItem(`weave_${roomId}_presentation_instance_id`) ||
            "{}",
        );
      } catch (ex) {
        console.error(
          "Error parsing presentation instance id from storage",
          ex,
        );
        presentationInstanceId = null;
      }

      setPresentationInstanceId(presentationInstanceId);
      if (presentationInstanceId === null) {
        setPresentationStatus("idle");
      } else {
        setPresentationStatus("loaded");
      }
    }
  }, []);

  if (!isRoomReady || isRoomSwitching) {
    return null;
  }

  return (
    <>
      <PresentationBuildStatus />
      <ToolbarButton
        icon={<Pickaxe strokeWidth={1} />}
        disabled={presentationStatus === "loading"}
        onClick={() => {
          triggerPresentationBuild();
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Build presentation</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={<Presentation strokeWidth={1} />}
        onClick={() => {
          setPresentationVisible(true);
        }}
        disabled={presentationStatus !== "loaded"}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>Presentation mode</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <Divider className="h-[20px]" />
    </>
  );
};

const PresentationBuildStatus = () => {
  const pageInfo = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const loadedPages = useCollaborationRoom(
    (state) => state.presentation.loadedPages,
  );
  const presentationStatus = useCollaborationRoom(
    (state) => state.presentation.status,
  );

  const { data } = useQuery({
    queryKey: ["getAllPages", pageInfo?.roomId ?? ""],
    queryFn: () => {
      return getAllPages(pageInfo?.roomId ?? "", "active");
    },
    enabled: !!pageInfo?.roomId && presentationStatus === "loading",
  });

  const totalPages = React.useMemo(() => {
    if (!data) {
      return 0;
    }

    return data.items.length;
  }, [data]);

  if (presentationStatus === "loading") {
    return (
      <div className="flex flex-col gap-8 justify-center items-center">
        {presentationStatus === "loading" && (
          <div className="flex gap-3 justify-center items-center">
            <div className="flex gap-3 justify-between items-center">
              <div className="w-full font-mono text-xs text-center whitespace-nowrap">
                BUILDING
              </div>
              <div className="font-mono text-xs text-center whitespace-nowrap">
                {Math.round((loadedPages / totalPages) * 100)}%
              </div>
            </div>
            <Progress
              className="w-[120px]"
              value={totalPages === 0 ? 0 : (loadedPages / totalPages) * 100}
            />
            <div className="flex justify-between items-center">
              {data?.length !== 0 && (
                <div className="font-mono text-xs text-center whitespace-nowrap">
                  {`${loadedPages} / ${totalPages}`} SLIDES
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
