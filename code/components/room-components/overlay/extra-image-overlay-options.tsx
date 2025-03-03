import { InputNumber } from "../inputs/input-number";

import { useWeave } from "@weavejs/react";
import { ToggleIconButton } from "../toggle-icon-button";
import { Crop } from "lucide-react";

function ExtraImageOverlayOptions() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);

  if (!instance) {
    return null;
  }

  if (!node) {
    return null;
  }

  if (!["image"].includes(node.type)) {
    return null;
  }

  return (
    <div className="w-full font-body-m-light p-4 pb-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Cropping</div>
        <div className="flex justify-end items-center">
          <ToggleIconButton
            kind="switch"
            icon={<Crop size={16} />}
            pressed={typeof node.props.cropX !== "undefined"}
            onClick={() => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  ...(typeof node.props.cropX !== "undefined"
                    ? {
                        width: node.props.imageInfo.width,
                        height: node.props.imageInfo.height,
                        cropX: null,
                        cropY: null,
                        cropWidth: null,
                        cropHeight: null,
                      }
                    : {
                        width: node.props.imageInfo.width,
                        height: node.props.imageInfo.height,
                        cropX: 0,
                        cropY: 0,
                        cropWidth: node.props.imageInfo.width,
                        cropHeight: node.props.imageInfo.height,
                      }),
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
        </div>
      </div>
      {typeof node.props.cropX !== "undefined" && (
        <div className="grid grid-cols-1 gap-3 w-full mt-3">
          <InputNumber
            label="X"
            value={node.props.cropX ?? 0}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  cropX: value,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
          <InputNumber
            label="Y"
            value={node.props.cropY ?? 0}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  cropY: value,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
          <InputNumber
            label="W"
            value={node.props.cropWidth ?? node.props.width}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  cropWidth: value,
                  width: value,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
          <InputNumber
            label="H"
            value={node.props.cropHeight ?? node.props.height}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  cropHeight: value,
                  height: value,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ExtraImageOverlayOptions;
