import { InputColor } from "./../inputs/input-color";
import { cn } from "@/lib/utils";

import { useWeave } from "@weavejs/react";
import { ToggleIconButton } from "./../toggle-icon-button";
import { Eye, EyeOff } from "lucide-react";

function RectangleOverlayOptions() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);

  if (!instance) {
    return null;
  }

  if (!node) {
    return null;
  }

  if (!["rectangle"].includes(node.type)) {
    return null;
  }

  return (
    <div className="w-full font-body-m-light p-4 pb-2">
      <div
        className={cn("flex justify-between items-center mb-3", {
          ["mb-0"]: !(node.props.fillEnabled ?? true),
        })}
      >
        <div className="text-sm font-medium">Fill</div>
        <div className="flex justify-end items-center">
          <ToggleIconButton
            kind="toggle"
            icon={<Eye size={16} />}
            pressedIcon={<EyeOff size={16} />}
            pressed={node.props.fillEnabled ?? true}
            onClick={() => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  fillEnabled: !(node.props.fillEnabled ?? true),
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
        </div>
      </div>
      {(node.props.fillEnabled ?? true) && (
        <div className="grid grid-cols-1 gap-3 w-full">
          <InputColor
            label="Color"
            value={`${(node.props.fill ?? "#000000FF").replace("#", "")}`}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  fill: `#${value}`,
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

export default RectangleOverlayOptions;
