
import OverlayOptionsSection from "./overlay-options-section";
import { InputColor } from "../inputs/input-color";
import withInstanceNode from "../with-instance-node";
import { Weave, WeaveStateElement } from "@weavejs/sdk";

function PantoneOverlayOptions({
  instance,
  node,
}: {
  instance: Weave;
  node: WeaveStateElement;
}) {
  return (
    <OverlayOptionsSection sectionTitle="Pantone properties">
      <div className="grid grid-cols-1 gap-3 w-full">
        <InputColor
          label="Color"
          value={`${((node?.props.pantone as string) ?? "#DEFFA0").replace(
            "#",
            ""
          )}`}
          onChange={(value) => {
            const updatedNode = {
              ...node,
              props: {
                ...node.props,
                pantone: `#${value}`,
              },
            };
            instance?.updateNode(updatedNode);
          }}
        />
      </div>
    </OverlayOptionsSection>
  );
}

const PantoneOverlayOptionsWithInstance = withInstanceNode(PantoneOverlayOptions);
PantoneOverlayOptionsWithInstance.displayName = "PantoneOverlayOptions";

export default PantoneOverlayOptionsWithInstance;
