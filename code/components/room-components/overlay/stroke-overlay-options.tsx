import { InputColor } from "../inputs/input-color";
import { ToggleIconButton } from "../toggle-icon-button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Eye,
  EyeOff,
  Hexagon,
  Slash,
  Spline,
  Tally1,
  Tally2,
  Tally3,
} from "lucide-react";
import { InputNumber } from "../inputs/input-number";
import withInstanceNode from "../with-instance-node";
import { Weave, WeaveStateElement } from "@inditextech/weavejs-sdk";

function StrokeOverlayOptions({
  instance,
  node,
}: {
  instance: Weave;
  node: WeaveStateElement;
}) {
  return (
    <AccordionItem value="stroke">
      <div className="w-full flex justify-between items-center gap-3 p-4 py-3">
        <AccordionTrigger className="cursor-pointer hover:no-underline items-center py-0">
          <span className="text-xs font-noto-sans-mono font-light">Stroke</span>
        </AccordionTrigger>
        <ToggleIconButton
          kind="toggle"
          icon={<Eye size={12} />}
          pressedIcon={<EyeOff size={12} />}
          pressed={node.props.strokeEnabled ?? true}
          onClick={(e) => {
            e.stopPropagation();
            const updatedNode = {
              ...node,
              props: {
                ...node.props,
                strokeEnabled: !(node.props.strokeEnabled ?? true),
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
            value={`${(node.props.stroke ?? "#000000FF").replace("#", "")}`}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  stroke: `#${value}`,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
          <InputNumber
            label="W"
            value={node.props.strokeWidth ?? 1}
            onChange={(value) => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  strokeWidth: value,
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
        </div>
        {["line"].includes(node.type) && (
          <div className="grid grid-cols-1 gap-3 w-full mt-3">
            <InputNumber
              label="Tension"
              value={node.props.tension ?? 0}
              onChange={(value) => {
                const updatedNode = {
                  ...node,
                  props: {
                    ...node.props,
                    tension: value,
                  },
                };
                instance.updateNode(updatedNode);
              }}
            />
            <div className="w-full flex justify-between items-center gap-4">
              <div className="text-xs font-noto-sans-mono font-light text-nowrap">
                Line join
              </div>
              <div className="w-full flex justify-end items-center gap-1">
                <ToggleIconButton
                  kind="switch"
                  icon={<Tally1 size={16} />}
                  pressed={(node.props.lineJoin ?? "miter") === "miter"}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        lineJoin: "miter",
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Tally2 size={16} />}
                  pressed={(node.props.lineJoin ?? "miter") === "round"}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        lineJoin: "round",
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Tally3 size={16} />}
                  pressed={(node.props.lineJoin ?? "miter") === "bevel"}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        lineJoin: "bevel",
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              </div>
            </div>
            <div className="w-full flex justify-between items-center gap-4">
              <div className="text-xs font-noto-sans-mono font-light text-nowrap">
                Line cap
              </div>
              <div className="w-full flex justify-end items-center gap-1">
                <ToggleIconButton
                  kind="switch"
                  icon={<Tally1 size={16} />}
                  pressed={(node.props.lineCap ?? "butt") === "butt"}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        lineCap: "butt",
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Tally2 size={16} />}
                  pressed={(node.props.lineCap ?? "butt") === "round"}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        lineCap: "round",
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Tally3 size={16} />}
                  pressed={(node.props.lineCap ?? "butt") === "square"}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        lineCap: "square",
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              </div>
            </div>
            <div className="w-full flex justify-between items-center gap-4">
              <div className="text-xs font-noto-sans-mono font-light text-nowrap">
                Open / Closed
              </div>
              <div className="w-full flex justify-end items-center gap-1">
                <ToggleIconButton
                  kind="switch"
                  icon={<Slash size={16} />}
                  pressed={(node.props.closed ?? false) === false}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        closed: false,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <ToggleIconButton
                  kind="switch"
                  icon={<Hexagon size={16} />}
                  pressed={(node.props.closed ?? false) === true}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        closed: true,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              </div>
            </div>
            <div className="w-full flex justify-between items-center gap-4">
              <div className="text-xs font-noto-sans-mono font-light text-nowrap">
                Bezier
              </div>
              <div className="w-full flex justify-end items-center gap-1">
                <ToggleIconButton
                  kind="switch"
                  icon={<Spline size={16} />}
                  pressed={(node.props.bezier ?? false) === true}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        bezier: !(node.props.bezier ?? false),
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

const StrokeOverlayOptionsWithInstance = withInstanceNode(StrokeOverlayOptions);
StrokeOverlayOptionsWithInstance.displayName = "StrokeOverlayOptions";

export default StrokeOverlayOptionsWithInstance;
