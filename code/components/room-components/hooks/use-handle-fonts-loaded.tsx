// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useWeave } from "@inditextech/weave-react";
import React from "react";
import { WeaveFont } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";

export const useHandleFontsLoaded = () => {
  const instance = useWeave((state) => state.instance);

  const fontsLoaded = useCollaborationRoom((state) => state.fonts.loaded);
  const setFontsLoaded = useCollaborationRoom((state) => state.setFontsLoaded);
  const setFontsValues = useCollaborationRoom((state) => state.setFontsValues);

  React.useEffect(() => {
    if (!instance) return;

    async function handleFontsLoaded(fonts: WeaveFont[]) {
      setFontsValues(fonts);
      setFontsLoaded(true);
    }

    instance.addEventListener("onFontsLoaded", handleFontsLoaded);

    return () => {
      instance.removeEventListener("onFontsLoaded", handleFontsLoaded);
    };
  }, [instance, fontsLoaded, setFontsLoaded, setFontsValues]);
};
