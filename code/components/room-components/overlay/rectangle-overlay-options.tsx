import { InputColor } from "./../inputs/input-color";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToggleIconButton } from "./../toggle-icon-button";
import { Eye, EyeOff } from "lucide-react";
import withInstanceNode from "../with-instance-node";
import { Weave, WeaveStateElement } from "@inditextech/weavejs-sdk";

function RectangleOverlayOptions({
  instance,
  node,
}: {
  instance: Weave;
  node: WeaveStateElement;
}) {
  return (
    <AccordionItem value="fill">
      <div className="w-full flex justify-between items-center gap-3 p-4 py-3">
        <AccordionTrigger className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-xs font-noto-sans-mono font-light">Fill</span>
        </AccordionTrigger>
        <ToggleIconButton
          kind="toggle"
          icon={<Eye size={12} />}
          pressedIcon={<EyeOff size={12} />}
          pressed={node.props.fillEnabled ?? true}
          onClick={(e) => {
            e.stopPropagation();
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
      <AccordionContent className="px-4 pb-4">
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
      </AccordionContent>
    </AccordionItem>
  );
}
const RectangleOverlayOptionsWithInstance = withInstanceNode(
  RectangleOverlayOptions
);
RectangleOverlayOptionsWithInstance.displayName = " RectangleOverlayOptions";

export default RectangleOverlayOptionsWithInstance;
