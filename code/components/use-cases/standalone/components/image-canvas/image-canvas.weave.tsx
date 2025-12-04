// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { WeaveProvider } from "@inditextech/weave-react";
import { ACTIONS, FONTS, NODES, PLUGINS } from "../../weave";
import { useGetStandaloneStore } from "../../hooks/use-get-standalone-store";
import { ImageCanvasLayout } from "./image-canvas.layout";
import { useStandaloneUseCase } from "../../store/store";

type ImageCanvasWeaveProps = {
  data: string | undefined;
};

export const ImageCanvasWeave = ({ data }: ImageCanvasWeaveProps) => {
  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const user = useStandaloneUseCase((state) => state.user);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const managingImageWidth = useStandaloneUseCase(
    (state) => state.managing.width
  );
  const managingImageHeight = useStandaloneUseCase(
    (state) => state.managing.height
  );

  const getUser = React.useCallback(() => {
    if (!user) {
      return {
        id: "dummy-user-id",
        name: "Dummy User",
        email: "dummy.user@example.com",
      };
    }
    return user;
  }, [user]);

  const store = useGetStandaloneStore({
    instanceId,
    imageId: managingImageId!,
    imageSize: { width: managingImageWidth, height: managingImageHeight },
    data,
    getUser,
  });

  if (!store) {
    return null;
  }

  return (
    <WeaveProvider
      getContainer={() => {
        return document?.getElementById("weave") as HTMLDivElement;
      }}
      store={store}
      fonts={FONTS}
      nodes={NODES()}
      plugins={PLUGINS(getUser)}
      actions={ACTIONS(getUser)}
    >
      <ImageCanvasLayout />
    </WeaveProvider>
  );
};
