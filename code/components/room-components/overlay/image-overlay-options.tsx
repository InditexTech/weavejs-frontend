
import { useWeave } from "@weavejs/react";
import OverlayOptionsSection from "./overlay-options-section";
import { InputNumber } from "../inputs/input-number";

function ImageOverlayOptions() {
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
    <OverlayOptionsSection sectionTitle="Image size">
    <div className="grid grid-cols-2 gap-3 w-full">
      <InputNumber
        label="W"
        value={node.props.imageInfo.width}
        onChange={(value) => {
          //TODO this is not working
          const updatedNode = {
            ...node,
            props: {
              ...node.props,
              cropWidth: value,
            },
          };
          instance.updateNode(updatedNode);
        }}
      />
      <InputNumber
        label="H"
        value={node.props.imageInfo.height}
        onChange={(value) => {
          //TODO this is not working
          const updatedNode = {
            ...node,
            props: {
              ...node.props,
              cropHeight: value,
            },
          };
          instance.updateNode(updatedNode);
        }}
      />
    </div>
  </OverlayOptionsSection>
  );
}

export default ImageOverlayOptions;
