import { useWeave } from "@weavejs/react";

import { InputColor } from "../inputs/input-color";
import { cn } from "@/lib/utils";
import { ToggleIconButton } from "../toggle-icon-button";
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

function StrokeOverlayOptions() {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);

  if (!node) {
    return null;
  }

  if (!instance) {
    return null;
  }

  if (!["rectangle", "line", "image"].includes(node.type)) {
    return null;
  }

  return (
    <div className="w-full font-body-m-light p-4 pb-2">
      <div
        className={cn("flex justify-between items-center mb-3", {
          ["mb-0"]: !(node.props.strokeEnabled ?? true),
        })}
      >
        <div className="text-sm font-medium">Stroke</div>
        <div className="flex justify-end items-center">
          <ToggleIconButton
            kind="toggle"
            icon={<Eye size={16} />}
            pressedIcon={<EyeOff size={16} />}
            pressed={node.props.strokeEnabled ?? true}
            onClick={() => {
              const updatedNode = {
                ...node,
                props: {
                  ...node.props,
                  strokeEnabled: !(node.props.trokeEnabled ?? true),
                },
              };
              instance.updateNode(updatedNode);
            }}
          />
        </div>
      </div>
      {(node.props.strokeEnabled ?? true) && (
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
      )}
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
            <div className="text-sm font-medium text-nowrap">Line join</div>
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
            <div className="text-sm font-medium text-nowrap">Line cap</div>
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
            <div className="text-sm font-medium text-nowrap">Open / Closed</div>
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
            <div className="text-sm font-medium">Bezier</div>
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
    </div>
  );
}

export default StrokeOverlayOptions;
