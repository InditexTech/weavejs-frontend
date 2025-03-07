import { InputText } from "../inputs/input-text";

import OverlayOptionsSection from "./overlay-options-section";
import withInstanceNode from "../with-instance-node";
import { Weave, WeaveStateElement } from "@inditextech/weavejs-sdk";

function WorkspaceOverlayOptions({
  instance,
  node,
}: {
  instance: Weave;
  node: WeaveStateElement;
}) {
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

const WorkspaceOverlayOptionsWithInstance = withInstanceNode(WorkspaceOverlayOptions);
WorkspaceOverlayOptionsWithInstance.displayName = "WorkspaceOverlayOptions";

export default WorkspaceOverlayOptionsWithInstance;