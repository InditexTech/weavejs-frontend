// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { WeaveProvider } from "@inditextech/weave-react";
import { ACTIONS, FONTS, NODES, PLUGINS } from "../../weave";
import { useGetStandaloneStore } from "../../hooks/use-get-standalone-store";
import { ImageCanvasLayout } from "./image-canvas.layout";
import { useStandaloneUseCase } from "../../store/store";
import useGetRendererKonvaBase from "@/components/room-components/hooks/use-get-renderer-konva-base";
import { useGetSession } from "@/components/room-components/hooks/use-get-session";
import { useCollaborationRoom } from "@/store/store";
import { WeaveUser } from "@inditextech/weave-types";
import { Logo } from "@/components/utils/logo";

type ImageCanvasWeaveProps = {
  data: string | undefined;
};

export const ImageCanvasWeave = ({ data }: ImageCanvasWeaveProps) => {
  const clientId = useCollaborationRoom((state) => state.clientId);
  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );
  const managingImageWidth = useStandaloneUseCase(
    (state) => state.managing.width,
  );
  const managingImageHeight = useStandaloneUseCase(
    (state) => state.managing.height,
  );

  const { session, isPending } = useGetSession();

  const getUser = React.useCallback(() => {
    return {
      id: `${session?.user.id}-${clientId}`,
      userId: session?.user.id,
      clientId: clientId,
      name: session?.user.name,
      email: session?.user.email,
      image: session?.user.image,
    } as WeaveUser;
  }, [session, clientId]);

  const renderer = useGetRendererKonvaBase();
  // const rendererProvider = useGetRendererKonvaReactReconciler();

  const store = useGetStandaloneStore({
    instanceId,
    imageId: managingImageId!,
    imageSize: { width: managingImageWidth, height: managingImageHeight },
    data,
    getUser,
  });

  if (isPending) {
    return (
      <main className="absolute top-0 left-0 right-0 bottom-0 w-full h-full block flex justify-center items-center">
        <div className="flex flex-col gap-3 justify-center items-center">
          <Logo kind="landscape" variant="no-text" />
          <div className="text-lg text-[#757575]">loading</div>
        </div>
      </main>
    );
  }

  if (!store || !renderer) {
    return null;
  }

  return (
    <WeaveProvider
      getContainer={() => {
        return document?.getElementById("weave") as HTMLDivElement;
      }}
      store={store}
      renderer={renderer}
      fonts={FONTS}
      nodes={NODES()}
      plugins={PLUGINS(getUser)}
      actions={ACTIONS(getUser)}
    >
      <ImageCanvasLayout />
    </WeaveProvider>
  );
};
