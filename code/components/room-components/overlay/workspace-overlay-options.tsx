import { InputText } from "../inputs/input-text";

import { useWeave } from "@weavejs/react";
import OverlayOptionsSection from "./overlay-options-section";

function WorkspaceOverlayOptions() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);

  if (!instance) {
    return null;
  }

  if (!node) {
    return null;
  }

  if (!["workspace"].includes(node.type)) {
    return null;
  }

  return (
    <OverlayOptionsSection sectionTitle="Workspace properties">
      <div className="grid grid-cols-1 gap-3 w-full">
        <InputText
          label="Title"
          value={`${node.props.title ?? "My workspace"}`}
          onChange={(value) => {
            const updatedNode = {
              ...node,
              props: {
                ...node.props,
                title: value,
              },
            };
            instance.updateNode(updatedNode);
          }}
        />
      </div>
    </OverlayOptionsSection>
  );
}

export default WorkspaceOverlayOptions;
