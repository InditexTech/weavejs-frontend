
import { useWeave } from "@weavejs/react";
import OverlayOptionsSection from "./overlay-options-section";
import { InputColor } from "../inputs/input-color";

function PantoneOverlayOptions() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);

  if (!node) {
    return null;
  }

  if (!["pantone"].includes(node.type)) {
    return null;
  }

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

export default PantoneOverlayOptions;
