"use client";

import React from "react";
import {
  Pin,
  PinOff,
  Eye,
  EyeOff,
  CaseSensitive,
  CaseUpper,
  RemoveFormatting,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignCenterHorizontal,
  AlignStartHorizontal,
  AlignEndHorizontal,
  Crop,
  Spline,
  Slash,
  Hexagon,
  Tally1,
  Tally2,
  Tally3,
} from "lucide-react";
import { InputNumber } from "./input-number";
import { InputText } from "./input-text";
import { ToggleIconButton } from "./toggle-icon-button";
import { InputPercentage } from "./input-percentage";
import { InputColor } from "./input-color";
import { useWeave } from "@weavejs/react";
import { WeaveStateElement } from "@weavejs/sdk";
import { useCollaborationRoom } from "@/store/store";
import { cn } from "@/lib/utils";

export const NodeProperties = () => {
  const instance = useWeave((state) => state.instance);
  const node = useWeave((state) => state.selection.node);

  const nodePropertiesVisible = useCollaborationRoom((state) => state.nodeProperties.visible);

  const nodeType = React.useMemo(() => {
    switch (node?.type) {
      case "group":
        return "Group";
      case "rectangle":
        return "Rectangle";
      case "line":
        return "Vector path";
      case "text":
        return "Text";
      case "image":
        return "Image";
      case "pantone":
        return "Pantone";
      case "workspace":
        return "Workspace";
      default:
        return "Unknown";
    }
  }, [node]);

  if (!instance) {
    return null;
  }

  if (!node) {
    return null;
  }

  if (!nodePropertiesVisible) {
    return null;
  }

  return (
    <div className="w-full justify-center items-center">
      <div className="w-full h-full flex flex-col gap-[1px] bg-light-background-1">
        <div className="w-full font-title-xs p-4 border-b border-light-border-3 bg-light-background-2">{nodeType}</div>
        <div className="w-full h-full overflow-scroll">
          {["pantone"].includes(node.type) && (
            <div className="w-full font-body-m-light p-4 pb-2">
              <div className="font-label-l-medium mb-3">Properties</div>
              <div className="grid grid-cols-1 gap-3 w-full">
                <InputColor
                  label="COLOR"
                  value={`${((node?.props.pantone as string) ?? "#DEFFA0").replace("#", "")}`}
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
            </div>
          )}
          {["workspace"].includes(node.type) && (
            <div className="w-full font-body-m-light p-4 pb-2">
              <div className="font-label-l-medium mb-3">Properties</div>
              <div className="grid grid-cols-1 gap-3 w-full">
                <InputText
                  label="TITLE"
                  value={`${node.props.title ?? "Moodboard 1"}`}
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
            </div>
          )}
          {["image"].includes(node.type) && (
            <div className="w-full font-body-m-light p-4 pb-2">
              <div className="flex justify-between items-center mb-3">
                <div className="font-label-l-medium">Information</div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <InputNumber
                  label="WIDTH"
                  value={node.props.imageInfo.width}
                  onChange={(value) => {
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
                  label="HEIGHT"
                  value={node.props.imageInfo.height}
                  onChange={(value) => {
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
            </div>
          )}
          <div className="w-full font-body-m-light p-4 pb-2">
            <div className="flex justify-between items-center mb-3">
              <div className="font-label-l-medium">Position</div>
              <div className="flex justify-end items-center">
                <ToggleIconButton
                  kind="toggle"
                  icon={<Pin size={16} />}
                  pressedIcon={<PinOff size={16} />}
                  pressed={node.props.draggable ?? true}
                  onClick={() => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node,
                        draggable: !(node.props.draggable ?? true),
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
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
                label="ROTATION"
                value={node.props.rotation ?? 0}
                onChange={(value) => {
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
                    point: { x: number; y: number },
                  ) {
                    const angleRad = degToRad(deltaDeg);
                    const x = Math.round(
                      point.x +
                        ((shape.props.x || 0) - point.x) * Math.cos(angleRad) -
                        ((shape.props.y || 0) - point.y) * Math.sin(angleRad),
                    );
                    const y = Math.round(
                      point.y +
                        ((shape.props.x || 0) - point.x) * Math.sin(angleRad) +
                        ((shape.props.y || 0) - point.y) * Math.cos(angleRad),
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

                  let updatedNode = {
                    ...node,
                  };
                  updatedNode = rotateAroundCenter(updatedNode, value - (updatedNode.props.rotation || 0));
                  instance.updateNode(updatedNode);
                }}
              />
            </div>
          </div>
          <div className="w-full font-body-m-light p-4 pb-2">
            <div className="font-label-l-medium mb-3">Layout</div>
            <div className="grid grid-cols-1 gap-3 w-full">
              <div className="w-full flex gap-3">
                <InputNumber
                  label="WIDTH"
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
                  label="HEIGHT"
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
                label="SCALE"
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
            </div>
          </div>
          <div className="w-full font-body-m-light p-4 pb-2">
            <div className="font-label-l-medium mb-4">Appearance</div>
            <div className="grid grid-cols-1 gap-3 w-full">
              <div className="grid grid-cols-1 gap-3 w-full">
                <InputPercentage
                  label="OPACITY"
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
                    label="CORNER RADIUS"
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
              </div>
            </div>
          </div>
          {["text"].includes(node.type) && (
            <div className="w-full font-body-m-light p-4 pb-2">
              <div className="font-label-l-medium mb-3">Typography</div>
              <div className="grid grid-cols-1 gap-3 w-full">
                <InputText
                  label="FONT"
                  value={`${node.props.fontFamily ?? null}`}
                  onChange={(value) => {
                    console.log("NEW FONT", value);
                  }}
                />
                <InputNumber
                  label="SIZE"
                  value={node.props.fontSize ?? 16}
                  onChange={(value) => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        fontSize: value,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <div className="w-full flex justify-between items-center gap-4">
                  <div className="font-body-m-light">Style</div>
                  <div className="w-full flex justify-end items-center gap-1">
                    <ToggleIconButton
                      kind="switch"
                      icon={<RemoveFormatting size={16} />}
                      pressed={(node.props.fontStyle ?? "normal").indexOf("normal") !== -1}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            fontStyle: "normal",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<Italic size={16} />}
                      pressed={(node.props.fontStyle ?? "normal").indexOf("italic") !== -1}
                      onClick={() => {
                        let items = [
                          ...(node.props.fontStyle ?? "normal").split(" ").filter((e: string) => e !== "normal"),
                        ];
                        if ((node.props.fontStyle ?? "normal").indexOf("italic") !== -1) {
                          items = items.filter((e: string) => e !== "italic");
                        }
                        if ((node.props.fontStyle ?? "normal").indexOf("italic") === -1) {
                          items = [...items];
                          items.push("italic");
                        }

                        if (items.length === 0) {
                          items = ["normal"];
                        }

                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            fontStyle: items.join(" "),
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<Bold size={16} />}
                      pressed={(node.props.fontStyle ?? "normal").indexOf("bold") !== -1}
                      onClick={() => {
                        let items = [
                          ...(node.props.fontStyle ?? "normal").split(" ").filter((e: string) => e !== "normal"),
                        ];
                        if ((node.props.fontStyle ?? "normal").indexOf("bold") !== -1) {
                          items = items.filter((e: string) => e !== "bold");
                        }
                        if ((node.props.fontStyle ?? "normal").indexOf("bold") === -1) {
                          items = [...items];
                          items.push("bold");
                        }

                        if (items.length === 0) {
                          items = ["normal"];
                        }

                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            fontStyle: items.join(" "),
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                  </div>
                </div>
                <div className="w-full flex justify-between items-center gap-4">
                  <div className="font-body-m-light">Variant</div>
                  <div className="w-full flex justify-end items-center gap-1">
                    <ToggleIconButton
                      kind="switch"
                      icon={<CaseSensitive size={16} />}
                      pressed={node.props.fontVariant === "normal"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            fontVariant: "normal",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<CaseUpper size={16} />}
                      pressed={node.props.fontVariant === "small-caps"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            fontVariant: "small-caps",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                  </div>
                </div>
                <div className="w-full flex justify-between items-center gap-4">
                  <div className="font-body-m-light">Decoration</div>
                  <div className="w-full flex justify-end items-center gap-1">
                    <ToggleIconButton
                      kind="switch"
                      icon={<RemoveFormatting size={16} />}
                      pressed={(node.props.textDecoration ?? "") === ""}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            textDecoration: "",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<Strikethrough size={16} />}
                      pressed={(node.props.textDecoration ?? "") === "line-through"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            textDecoration: "line-through",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<Underline size={16} />}
                      pressed={(node.props.textDecoration ?? "") === "underline"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            textDecoration: "underline",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                  </div>
                </div>
                <div className="w-full flex justify-between items-center gap-4">
                  <div className="font-body-m-light text-nowrap">Alignment</div>
                  <div className="w-full flex justify-end items-center gap-1">
                    <ToggleIconButton
                      kind="switch"
                      icon={<AlignLeft size={16} />}
                      pressed={(node.props.align ?? "") === "left"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            align: "left",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<AlignCenter size={16} />}
                      pressed={(node.props.align ?? "") === "center"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            align: "center",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<AlignRight size={16} />}
                      pressed={(node.props.align ?? "") === "right"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            align: "right",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                  </div>
                </div>

                <div className="w-full flex justify-between items-center gap-4">
                  <div className="font-body-m-light text-nowrap">Vertical Alignment</div>
                  <div className="w-full flex justify-end items-center gap-1">
                    <ToggleIconButton
                      kind="switch"
                      icon={<AlignStartHorizontal size={16} />}
                      pressed={(node.props.verticalAlign ?? "top") === "top"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            verticalAlign: "top",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<AlignCenterHorizontal size={16} />}
                      pressed={(node.props.verticalAlign ?? "top") === "middle"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            verticalAlign: "middle",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                    <ToggleIconButton
                      kind="switch"
                      icon={<AlignEndHorizontal size={16} />}
                      pressed={(node.props.verticalAlign ?? "") === "bottom"}
                      onClick={() => {
                        const updatedNode = {
                          ...node,
                          props: {
                            ...node.props,
                            verticalAlign: "bottom",
                          },
                        };
                        instance.updateNode(updatedNode);
                      }}
                    />
                  </div>
                </div>
                <InputNumber
                  label="LINE HEIGHT"
                  value={node.props.lineHeight ?? 1}
                  onChange={(value) => {
                    const updatedNode = {
                      ...node,
                      props: {
                        ...node.props,
                        lineHeight: value,
                      },
                    };
                    instance.updateNode(updatedNode);
                  }}
                />
                <InputColor
                  label="COLOR"
                  value={`${node.props.fill.replace("#", "")}`}
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
            </div>
          )}
          {["rectangle"].includes(node.type) && (
            <div className="w-full font-body-m-light p-4 pb-2">
              <div
                className={cn("flex justify-between items-center mb-3", {
                  ["mb-0"]: !(node.props.fillEnabled ?? true),
                })}
              >
                <div className="font-label-l-medium">Fill</div>
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
                    label="COLOR"
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
          )}
          {["rectangle", "line", "image"].includes(node.type) && (
            <div className="w-full font-body-m-light p-4 pb-2">
              <div
                className={cn("flex justify-between items-center mb-3", {
                  ["mb-0"]: !(node.props.strokeEnabled ?? true),
                })}
              >
                <div className="font-label-l-medium">Stroke</div>
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
                    label="COLOR"
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
                    label="WIDTH"
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
                    label="TENSION"
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
                    <div className="font-body-m-light text-nowrap">Line join</div>
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
                    <div className="font-body-m-light text-nowrap">Line cap</div>
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
                    <div className="font-body-m-light text-nowrap">Open / Closed</div>
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
                    <div className="font-body-m-light text-nowrap">Bezier</div>
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
          )}
          {["image"].includes(node.type) && (
            <div className="w-full font-body-m-light p-4 pb-2">
              <div className="flex justify-between items-center">
                <div className="font-label-l-medium">Cropping</div>
                <div className="flex justify-end items-center">
                  <ToggleIconButton
                    kind="switch"
                    icon={<Crop size={16} />}
                    pressed={typeof node.props.cropX !== "undefined"}
                    onClick={() => {
                      const updatedNode = {
                        ...node,
                        props: {
                          ...node.props,
                          ...(typeof node.props.cropX !== "undefined"
                            ? {
                                width: node.props.imageInfo.width,
                                height: node.props.imageInfo.height,
                                cropX: null,
                                cropY: null,
                                cropWidth: null,
                                cropHeight: null,
                              }
                            : {
                                width: node.props.imageInfo.width,
                                height: node.props.imageInfo.height,
                                cropX: 0,
                                cropY: 0,
                                cropWidth: node.props.imageInfo.width,
                                cropHeight: node.props.imageInfo.height,
                              }),
                        },
                      };
                      instance.updateNode(updatedNode);
                    }}
                  />
                </div>
              </div>
              {typeof node.props.cropX !== "undefined" && (
                <div className="grid grid-cols-1 gap-3 w-full mt-3">
                  <InputNumber
                    label="X"
                    value={node.props.cropX ?? 0}
                    onChange={(value) => {
                      const updatedNode = {
                        ...node,
                        props: {
                          ...node.props,
                          cropX: value,
                        },
                      };
                      instance.updateNode(updatedNode);
                    }}
                  />
                  <InputNumber
                    label="Y"
                    value={node.props.cropY ?? 0}
                    onChange={(value) => {
                      const updatedNode = {
                        ...node,
                        props: {
                          ...node.props,
                          cropY: value,
                        },
                      };
                      instance.updateNode(updatedNode);
                    }}
                  />
                  <InputNumber
                    label="WIDTH"
                    value={node.props.cropWidth ?? node.props.width}
                    onChange={(value) => {
                      const updatedNode = {
                        ...node,
                        props: {
                          ...node.props,
                          cropWidth: value,
                          width: value,
                        },
                      };
                      instance.updateNode(updatedNode);
                    }}
                  />
                  <InputNumber
                    label="HEIGHT"
                    value={node.props.cropHeight ?? node.props.height}
                    onChange={(value) => {
                      const updatedNode = {
                        ...node,
                        props: {
                          ...node.props,
                          cropHeight: value,
                          height: value,
                        },
                      };
                      instance.updateNode(updatedNode);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
