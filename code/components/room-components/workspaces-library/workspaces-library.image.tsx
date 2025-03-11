import React from "react";
import Image from "next/image";
import Konva from "konva";
import { toImageAsync } from "./utils";

type WorkspaceImageProps = {
  node: Konva.Group;
};

export const WorkspaceImage = ({ node }: Readonly<WorkspaceImageProps>) => {
  const [image, setImage] = React.useState<React.ReactElement | null>(null);

  React.useEffect(() => {
    setInterval(async () => {
      const nodeAttrs = node.getAttrs();
      try {
        // const box = workspaceInternal.getClientRect({ relativeTo: stage });
        const workspaceBg = node.findOne(`#${nodeAttrs.id}-bg`) as Konva.Group;
        if (!workspaceBg) {
          return;
        }
        const boxBg = workspaceBg.getClientRect();
        const img = await toImageAsync(node, boxBg);
        setImage(
          <Image
            src={img.src}
            width={284}
            height={201}
            alt="A workspace image"
            className="object-fit w-full h-full"
          />
        );
      } catch (ex) {
        console.error(ex);
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full aspect-video border border-light-border-1">
      {image}
    </div>
  );
};
