// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveKonvaReactReconcilerRenderer } from "@inditextech/weave-renderer-konva-react-reconciler";

function useGetRendererKonvaReactReconciler() {
  const [renderer, setRenderer] =
    React.useState<WeaveKonvaReactReconcilerRenderer | null>(null);

  React.useEffect(() => {
    if (!renderer) {
      const konvaReactReconcilerRenderer =
        new WeaveKonvaReactReconcilerRenderer();

      setRenderer(konvaReactReconcilerRenderer);
    }
  }, [renderer]);

  return renderer;
}

export default useGetRendererKonvaReactReconciler;
