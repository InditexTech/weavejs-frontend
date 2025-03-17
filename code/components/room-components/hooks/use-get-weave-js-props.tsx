/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import {
  WeaveBrushToolAction,
  WeaveFrameToolAction,
  WeaveImageToolAction,
  WeavePenToolAction,
  WeaveRectangleToolAction,
} from "@inditextech/weavejs-sdk";

import { useCollaborationRoom } from "@/store/store";
import {
  ACTIONS,
  CUSTOM_PLUGINS,
  FONTS,
  NODES,
} from "@/components/utils/constants";
import useContextMenu from "./use-context-menu";
import { PantoneToolAction } from "@/components/actions/pantone-tool/pantone-tool";

function useGetWeaveJSProps() {
  const setLoadingImage = useCollaborationRoom(
    (state) => state.setLoadingImage
  );

  const setNodePropertiesCreateProps = useCollaborationRoom(
    (state) => state.setNodePropertiesCreateProps
  );
  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );
  const setFinishUploadCallbackImage = useCollaborationRoom(
    (state) => state.setFinishUploadCallbackImage
  );

  const { contextMenu } = useContextMenu();

  const memoizedActions = React.useMemo(
    () => [
      new WeaveRectangleToolAction({
        onPropsChange: (props) => {
          setNodePropertiesCreateProps(props);
        },
      }),
      new WeavePenToolAction({
        onPropsChange: (props) => {
          setNodePropertiesCreateProps(props);
        },
      }),
      new WeaveBrushToolAction({
        onPropsChange: (props) => {
          setNodePropertiesCreateProps(props);
        },
      }),
      new WeaveImageToolAction({
        onPropsChange: (props) => {
          setNodePropertiesCreateProps(props);
        },
        onUploadImage: async (finished: (imageURL: string) => void) => {
          setFinishUploadCallbackImage(finished);
          setShowSelectFileImage(true);
        },
        onImageLoadStart: () => {
          setLoadingImage(true);
        },
        onImageLoadEnd: () => {
          setLoadingImage(false);
        },
      }),
      new WeaveFrameToolAction({
        onPropsChange: (props) => {
          setNodePropertiesCreateProps(props);
        },
      }),
      new PantoneToolAction({
        onPropsChange: (props) => {
          setNodePropertiesCreateProps(props);
        },
      }),
      ...ACTIONS,
    ],
    [
      setNodePropertiesCreateProps,
      setLoadingImage,
      setFinishUploadCallbackImage,
      setShowSelectFileImage,
    ]
  );

  const memoizedCustomPlugins = React.useMemo(() => {
    return [...CUSTOM_PLUGINS, contextMenu];
  }, [contextMenu]);

  return {
    fonts: FONTS,
    nodes: NODES,
    customPlugins: memoizedCustomPlugins,
    actions: memoizedActions,
  };
}

export default useGetWeaveJSProps;
