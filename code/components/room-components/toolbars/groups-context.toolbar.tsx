// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import Konva from "konva";
import { Badge } from "@/components/ui/badge";
import { Divider } from "../overlay/divider";

export const GroupsContextToolbar = () => {
  const instance = useWeave((state) => state.instance);

  const [actualGroupContext, setActualGroupContext] =
    React.useState<Konva.Group | null>(null);

  React.useEffect(() => {
    if (!instance) return;

    const handleGroupContextChange = (groupId: string) => {
      if (!instance) return;

      const stage = instance.getStage();

      const groupNode = stage.findOne(`#${groupId}`) as Konva.Group | null;

      if (!groupNode || groupId === "mainLayer") {
        setActualGroupContext(null);
        return;
      }

      setActualGroupContext(groupNode);
    };

    instance.addEventListener("onGroupContextChange", handleGroupContextChange);

    return () => {
      instance.removeEventListener(
        "onGroupContextChange",
        handleGroupContextChange,
      );
    };
  }, [instance]);

  if (!actualGroupContext) return;

  return (
    <>
      <div className="flex gap-1 justify-end items-center">
        <div className="font-mono text-xs">Edition context</div>
        <Badge className="font-mono text-xs" variant="secondary">
          {actualGroupContext.getAttrs().nodeName || actualGroupContext.id()}
        </Badge>
      </div>
      <Divider className="h-[20px]" />
    </>
  );
};
