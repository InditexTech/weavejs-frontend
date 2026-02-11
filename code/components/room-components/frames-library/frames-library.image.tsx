// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import _ from "lodash";
import React from "react";
import Image from "next/image";
import Konva from "konva";
import { toImageAsync } from "./utils";
import { useWeave } from "@inditextech/weave-react";

type FrameImageProps = {
  node: Konva.Group;
};

export const FrameImage = ({ node }: Readonly<FrameImageProps>) => {
  const [image, setImage] = React.useState<React.ReactElement | null>(null);

  const instance = useWeave((state) => state.instance);

  React.useEffect(() => {
    const loadImage = async () => {
      if (!instance) return;

      const nodeAttrs = node.getAttrs();
      try {
        const bounds = instance.getExportBoundingBox([nodeAttrs.containerId]);
        const img = await toImageAsync(node, {
          x: bounds.x,
          y: bounds.y,
          pixelRatio: 4,
          width: bounds.width,
          height: bounds.height,
        });
        setImage(
          <Image
            src={img.src}
            width={320}
            height={225}
            alt="A frame image"
            className="object-fit w-full h-auto"
          />,
        );
      } catch (ex) {
        console.error(ex);
      }
    };

    loadImage();
    const debouncedLoadImage = _.debounce(loadImage, 250);

    const eventHandler = () => {
      debouncedLoadImage();
    };

    instance?.addEventListener("onStateChange", eventHandler);

    return () => {
      instance?.removeEventListener("onStateChange", eventHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  return (
    <div className="w-full aspect-video border border-[#c9c9c9]">{image}</div>
  );
};
