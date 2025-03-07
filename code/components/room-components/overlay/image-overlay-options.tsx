
import OverlayOptionsSection from "./overlay-options-section";
import { InputNumber } from "../inputs/input-number";
import withInstanceNode from "../with-instance-node";
import { Weave, WeaveStateElement } from "@inditextech/weavejs-sdk";

function ImageOverlayOptions({
  instance,
  node,
}: {
  instance: Weave;
  node: WeaveStateElement;
}) {
  return (
    <OverlayOptionsSection sectionTitle="Image size">
    <div className="grid grid-cols-2 gap-3 w-full">
      <InputNumber
        label="W"
        value={node.props.imageInfo.width}
        onChange={(value) => {
          //TODO this is not working - https://github.com/InditexTech/weavejs-frontend/issues/3
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
          //TODO this is not working - https://github.com/InditexTech/weavejs-frontend/issues/3
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


const ImageOverlayOptionsWithInstance = withInstanceNode(ImageOverlayOptions);
ImageOverlayOptionsWithInstance.displayName = "ImageOverlayOptions";

export default ImageOverlayOptionsWithInstance;
