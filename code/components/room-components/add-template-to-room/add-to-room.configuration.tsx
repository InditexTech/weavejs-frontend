// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAddTemplateToRoom } from "@/store/add-template-to-room";
import { useJsonTemplate } from "../hooks/use-json-template";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AddToRoomRenderTemplate } from "./add-to-room.render-template";
import { Input } from "@/components/ui/input";

export function AddToRoomConfiguration() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [templateData, setTemplateData] = React.useState<any>(null);

  const [text, setText] = React.useState("");

  const initialized = useAddTemplateToRoom((state) => state.initialized);
  const room = useAddTemplateToRoom((state) => state.room);
  const page = useAddTemplateToRoom((state) => state.page);
  const template = useAddTemplateToRoom((state) => state.template);
  const selectedImages = useAddTemplateToRoom((state) => state.images);
  const templateParameters = useAddTemplateToRoom((state) => state.parameters);
  const selectedNode = useAddTemplateToRoom((state) => state.selectedNode);
  const setTemplate = useAddTemplateToRoom((state) => state.setTemplate);
  const setSelectedNode = useAddTemplateToRoom(
    (state) => state.setSelectedNode,
  );
  const setStep = useAddTemplateToRoom((state) => state.setStep);
  const setTemplateParameters = useAddTemplateToRoom(
    (state) => state.setTemplateParameters,
  );
  const setInitialized = useAddTemplateToRoom((state) => state.setInitialized);

  const { getNodeMetadata, getTemplateNodesMetadata, setupTemplateDefaults } =
    useJsonTemplate();

  React.useEffect(() => {
    if (!template) return;

    try {
      const templateData = JSON.parse(template.templateData);
      setTemplateData(templateData);
    } catch {
      setTemplateData(null);
    }
  }, [template]);

  React.useEffect(() => {
    if (room && page && !initialized && templateData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imageNodes: any[] = getTemplateNodesMetadata(templateData, [
        "image",
      ]);
      const sortedImageNodes = imageNodes.sort((a, b) =>
        a.id.localeCompare(b.id),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imageTemplateParameters: Record<string, any> = {
        ...templateParameters,
      };

      for (let i = 0; i < sortedImageNodes.length; i++) {
        const imageNode = selectedImages?.[i];
        const node = sortedImageNodes[i];
        const nodeId = node.id;
        if (imageNode) {
          imageTemplateParameters[nodeId] = {
            ...imageTemplateParameters[nodeId],
            nodeId,
            kind: "image",
            properties: {
              image: {
                source: imageNode.url,
                width: imageNode.size.width,
                height: imageNode.size.height,
              },
              fit: "cover",
            },
          };
        } else {
          delete imageTemplateParameters[nodeId];
        }
      }

      const defaultTemplateParameters = setupTemplateDefaults(
        templateData,
        imageTemplateParameters,
      );

      setTemplateParameters(defaultTemplateParameters);
      setInitialized(true);
    }
  }, [
    room,
    page,
    initialized,
    selectedImages,
    templateData,
    setupTemplateDefaults,
    setInitialized,
  ]);

  const nodeMetadata = React.useMemo(() => {
    if (!templateData || !selectedNode) return null;

    return getNodeMetadata(templateData, selectedNode);
  }, [templateData, selectedNode, getNodeMetadata]);

  React.useEffect(() => {
    if (selectedNode && nodeMetadata?.kind === "text") {
      setText(templateParameters?.[selectedNode]?.properties?.text || "");
    } else {
      setText("");
    }
  }, [selectedNode, nodeMetadata, templateParameters]);

  if (!template || !room) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols gir-rows-[auto_1fr_auto_auto] gap-5">
        <DialogDescription className="font-inter text-sm my-0">
          Check the selection and confirm to add the images to the room.
        </DialogDescription>
        <div className="relative border-[0.5px] border-[#c9c9c9] bg-[#c9c9c9] flex flex-col justify-center items-center">
          <div className="aspect-square bg-[#c9c9c9] flex flex-col justify-center items-center">
            <AddToRoomRenderTemplate
              readOnly={false}
              width={600}
              height={600}
            />
          </div>
          <div className="w-full h-[200px] grid grid-cols-1 grid-rows-1 bg-white">
            <div className="col-span-2 font-inter text-base text-right border-t-[0.5px] border-t-[#c9c9c9]">
              <div className="w-full h-[200px]">
                <ScrollArea className="w-full h-full">
                  <div className="flex gap-[1px] justify-start items-center">
                    {selectedImages.map((image) => {
                      return (
                        <div
                          role="button"
                          key={image.id}
                          onClick={
                            selectedNode
                              ? () => {
                                  const newParameters = {
                                    ...templateParameters,
                                    [selectedNode]: {
                                      nodeId: selectedNode,
                                      kind: "image",
                                      properties: {
                                        image: {
                                          source: image.url,
                                          width: image.size.width,
                                          height: image.size.height,
                                        },
                                        fit: "cover",
                                      },
                                    },
                                  };

                                  setTemplateParameters(newParameters);
                                }
                              : undefined
                          }
                        >
                          <img
                            className="object-contain h-full max-h-[200px] cursor-pointer"
                            src={image.url}
                            alt={`image ${image.id} thumbnail`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-3"></div>
        <div className="h-[calc(100dvh-48px-32px-72px-20px-807px-25px-25px-48px-185px)] flex flex-col gap-3">
          {nodeMetadata && selectedNode && (
            <>
              <div className="w-full flex justify-between items-center font-light text-xs min-h-[30px]">
                <div className="text-lg mb-5">Element</div>
                <Button
                  className="!rounded-none"
                  size="xs"
                  variant="destructive"
                  onClick={() => {
                    const newParameters = {
                      ...templateParameters,
                    };
                    delete newParameters[selectedNode];
                    setTemplateParameters(newParameters);
                  }}
                >
                  RESET
                </Button>
              </div>
              <div className="w-full flex justify-between items-center font-light text-xs min-h-[30px]">
                <div>Id / Kind</div>
                <div>
                  <Badge>{nodeMetadata.id}</Badge> /{" "}
                  <Badge>{nodeMetadata.kind}</Badge>
                </div>
              </div>
            </>
          )}
          {nodeMetadata && selectedNode && nodeMetadata.kind === "image" && (
            <>
              <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
              <div className="w-full flex justify-between items-center font-light text-xs">
                <div>Image format</div>
                <Select
                  value={
                    templateParameters?.[selectedNode]?.properties?.fit ||
                    "cover"
                  }
                  onValueChange={(value) => {
                    const newParameters = {
                      ...templateParameters,
                      [selectedNode]: {
                        ...templateParameters[selectedNode],
                        properties: {
                          ...templateParameters[selectedNode]?.properties,
                          fit: value,
                        },
                      },
                    };

                    setTemplateParameters(newParameters);
                  }}
                >
                  <SelectTrigger className="font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none">
                    <SelectValue placeholder="Amount" />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                    align="end"
                  >
                    <SelectGroup>
                      <SelectItem
                        value="cover"
                        className="font-inter text-xs rounded-none"
                      >
                        COVER
                      </SelectItem>
                      <SelectItem
                        value="contain"
                        className="font-inter text-xs rounded-none"
                      >
                        CONTAIN
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {nodeMetadata && selectedNode && nodeMetadata.kind === "text" && (
            <>
              <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9]"></div>
              <div className="w-full flex justify-between items-center font-light text-xs">
                <div className="w-full">Text</div>
                <div className="w-full">
                  <Input
                    className="w-full font-inter !py-1 !pt-[2px] text-right text-xs rounded-none !h-[30px] !border-black !shadow-none"
                    value={text}
                    onFocus={() => {
                      window.weaveOnFieldFocus = true;
                    }}
                    onBlurCapture={() => {
                      window.weaveOnFieldFocus = false;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const newParameters = {
                          ...templateParameters,
                          [selectedNode]: {
                            ...templateParameters[selectedNode],
                            nodeId: selectedNode,
                            kind: "text",
                            properties: {
                              ...templateParameters[selectedNode].properties,
                              text,
                            },
                          },
                        };

                        setTemplateParameters(newParameters);
                      }
                    }}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          {!nodeMetadata && !selectedNode && (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="w-[50%] font-light text-base text-center">
                Select an element, if the element is an:
                <br />
                <br />
                <span className="text-sm">
                  For <Badge>image</Badge> elements, click on the element and
                  then select one of the images below to set it as content of
                  the element.
                </span>
                <br />
                <br />
                <span className="text-sm">
                  For <Badge>text</Badge> elements, click on the element and
                  then define the text.
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="w-full min-h-[0.5px] h-[0.5px] bg-[#c9c9c9] my-3"></div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="cursor-pointer font-inter rounded-none"
            onClick={() => {
              setTemplate(undefined);
              setInitialized(false);
              setTemplateParameters({});
              setSelectedNode(null);
              setStep("select-template");
            }}
          >
            BACK
          </Button>
          <Button
            type="button"
            className="cursor-pointer font-inter rounded-none"
            onClick={() => {
              setSelectedNode(null);
              setStep("confirm");
            }}
          >
            CONTINUE
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
