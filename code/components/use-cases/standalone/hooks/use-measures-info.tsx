// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import Konva from "konva";
import { MEASURE_NODE_TYPE } from "../nodes/measure/constants";
import { MeasureNode } from "../nodes/measure/measure";

export const useMeasuresInfo = () => {
  const instance = useWeave((state) => state.instance);

  const [measures, setMeasures] = React.useState<Konva.Group[]>([]);
  const [scale, setScale] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const handleUpdateNodes = () => {
      const stage = instance.getStage();

      const measures = stage.find<Konva.Group>(`.${MEASURE_NODE_TYPE}`);
      setMeasures(measures);

      const measureHandler =
        instance.getNodeHandler<MeasureNode>(MEASURE_NODE_TYPE);

      if (measureHandler) {
        setScale(measureHandler.calculateUnitPerPixel());
      }
    };

    instance.addEventListener("onStateChange", handleUpdateNodes);

    return () => {
      instance.removeEventListener("onStateChange", handleUpdateNodes);
    };
  }, [instance]);

  return { scale, measures };
};
