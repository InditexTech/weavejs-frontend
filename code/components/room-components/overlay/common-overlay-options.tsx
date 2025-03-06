"use client";

import React from "react";
import { Pin, PinOff } from "lucide-react";
import type { Weave, WeaveStateElement } from "@inditextech/weavejs-sdk";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InputNumber } from "../inputs/input-number";
import { ToggleIconButton } from "../toggle-icon-button";
import { InputPercentage } from "../inputs/input-percentage";
import withInstanceNode from "../with-instance-node";

const motionProps = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.8, ease: "easeInOut" },
};

function CommonOverlayOptions({ instance, node }: {
  instance: Weave;
  node: WeaveStateElement;
}) {
  const onRotationChange = React.useCallback(
    (value: number) => {
      function degToRad(angle: number) {
        return (angle / 180) * Math.PI;
      }

      function getCenter(shape: WeaveStateElement) {
        const angleRad = degToRad(shape.props.rotation || 0);
        return {
          x:
            (shape.props.x || 0) +
            ((shape.props.width || 0) / 2) * Math.cos(angleRad) +
            ((shape.props.height || 0) / 2) * Math.sin(-angleRad),
          y:
            (shape.props.y || 0) +
            ((shape.props.height || 0) / 2) * Math.cos(angleRad) +
            ((shape.props.width || 0) / 2) * Math.sin(angleRad),
        };
      }

      function rotateAroundPoint(
        shape: WeaveStateElement,
        deltaDeg: number,
        point: { x: number; y: number }
      ) {
        const angleRad = degToRad(deltaDeg);
        const x = Math.round(
          point.x +
            ((shape.props.x || 0) - point.x) * Math.cos(angleRad) -
            ((shape.props.y || 0) - point.y) * Math.sin(angleRad)
        );
        const y = Math.round(
          point.y +
            ((shape.props.x || 0) - point.x) * Math.sin(angleRad) +
            ((shape.props.y || 0) - point.y) * Math.cos(angleRad)
        );
        return {
          ...shape,
          props: {
            ...shape.props,
            rotation: Math.round((shape.props.rotation || 0) + deltaDeg),
            x,
            y,
          },
        };
      }

      function rotateAroundCenter(shape: WeaveStateElement, deltaDeg: number) {
        const center = getCenter(shape);
        return rotateAroundPoint(shape, deltaDeg, center);
      }

      if (!node) return;

      let updatedNode = {
        ...node,
      };
      updatedNode = rotateAroundCenter(
        updatedNode,
        value - (updatedNode.props.rotation || 0)
      );
      instance.updateNode(updatedNode);
    },
    [instance, node]
  );

  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="position">
          <div className="flex justify-between items-center p-2">
            <AccordionTrigger className="pointer pointer-events-auto hover:no-underline p-2">
              <span className="text-sm font-medium">Position</span>
            </AccordionTrigger>
            <ToggleIconButton
              kind="toggle"
              icon={<Pin size={16} />}
              pressedIcon={<PinOff size={16} />}
              pressed={node.props.draggable ?? true}
              onClick={() => {
                const updatedNode = {
                  ...node,
                  props: {
                    ...node.props,
                    draggable: !(node.props.draggable ?? true),
                  },
                };
                instance.updateNode(updatedNode);
              }}
            />
          </div>
          <AccordionContent className="px-4 pb-4">
            <motion.div
              {...motionProps}
              className="grid grid-cols-1 gap-3 w-full"
            >
              <div className="grid grid-cols-2 gap-3 w-full">
                <InputNumber
                  label="X"
                  value={node.props.x ?? 0}
                  onChange={(value) => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        x: value,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <InputNumber
                  label="Y"
                  value={node.props.y ?? 0}
                  onChange={(value) => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        y: value,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              </div>
              <InputNumber
                label="Rotation"
                value={node.props.rotation ?? 0}
                onChange={onRotationChange}
              />
            </motion.div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger className="pointer pointer-events-auto hover:no-underline p-4">
            <span className="text-sm font-medium">Size</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <motion.div
              {...motionProps}
              className="grid grid-cols-1 gap-3 w-full"
            >
              <div className="w-full flex gap-3">
                <InputNumber
                  label="W"
                  disabled={["pantone"].includes(node.type)}
                  value={node.props.width ?? 0}
                  onChange={(value) => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        width: value,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <InputNumber
                  label="H"
                  disabled={["pantone"].includes(node.type)}
                  value={node.props.height ?? 0}
                  onChange={(value) => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        height: value,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              </div>
              <InputPercentage
                label="Scale"
                value={node.props.scaleX ?? 1}
                onChange={(value) => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      scaleX: value,
                      scaleY: value,
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
            </motion.div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="appearance">
          <AccordionTrigger className="pointer pointer-events-auto hover:no-underline p-4">
            <span className="text-sm font-medium">Appearance</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <motion.div
              {...motionProps}
              className="grid grid-cols-1 gap-3 w-full"
            >
              <InputPercentage
                label="Opacity"
                max={100}
                min={0}
                value={node.props.opacity ?? 1}
                onChange={(value) => {
                  const updatedNode = {
                    ...node,
                    props: {
                      ...node.props,
                      opacity: value,
                    },
                  };
                  instance.updateNode(updatedNode);
                }}
              />
              {["rectangle"].includes(node.type) && (
                <InputNumber
                  label="Corner Radius"
                  value={node.props.cornerRadius ?? 0}
                  onChange={(value) => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        cornerRadius: value,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              )}
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const CommonOverlayWithInstance = withInstanceNode(CommonOverlayOptions);
CommonOverlayWithInstance.displayName = "CommonOverlayOptions";

export default CommonOverlayWithInstance;
