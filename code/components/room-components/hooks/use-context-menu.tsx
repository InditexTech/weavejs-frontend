// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  WeaveContextMenuPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveExportNodesActionParams,
  WeaveStageContextMenuPluginOnNodeContextMenuEvent,
} from "@inditextech/weave-sdk";
import { WeaveSelection } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { ContextMenuOption } from "../context-menu";
import { ShortcutElement } from "../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import Konva from "konva";
import {
  ClipboardCopy,
  ClipboardPaste,
  Group,
  Bot,
  Ungroup,
  Trash,
  SendToBack,
  BringToFront,
  ArrowUp,
  ArrowDown,
  ImageDown,
  Lock,
  EyeOff,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { postRemoveBackground } from "@/api/post-remove-background";
import { useIACapabilities } from "@/store/ia";

function useContextMenu() {
  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const contextMenuShow = useCollaborationRoom(
    (state) => state.contextMenu.show
  );
  const setContextMenuShow = useCollaborationRoom(
    (state) => state.setContextMenuShow
  );
  const setContextMenuPosition = useCollaborationRoom(
    (state) => state.setContextMenuPosition
  );
  const setContextMenuOptions = useCollaborationRoom(
    (state) => state.setContextMenuOptions
  );
  const setTransformingImage = useCollaborationRoom(
    (state) => state.setTransformingImage
  );
  const aiEnabled = useIACapabilities((state) => state.enabled);
  const setImagesLLMPopupSelectedNodes = useIACapabilities(
    (state) => state.setImagesLLMPopupSelectedNodes
  );
  const setImagesLLMPopupType = useIACapabilities(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
  );
  const setImagesLLMPopupImage = useIACapabilities(
    (state) => state.setImagesLLMPopupImage
  );

  const mutationUpload = useMutation({
    mutationFn: async (imageId: string) => {
      return await postRemoveBackground(room ?? "", imageId);
    },
  });

  React.useEffect(() => {
    if (!instance) return;

    if (!contextMenuShow) {
      const contextMenuPlugin =
        instance.getPlugin<WeaveContextMenuPlugin>("contextMenu");
      if (contextMenuPlugin) {
        contextMenuPlugin.closeContextMenu();
      }
    }
  }, [instance, contextMenuShow]);

  const getContextMenu = React.useCallback(
    ({
      actActionActive,
      canUnGroup,
      nodes,
      canGroup,
    }: {
      actActionActive: string | undefined;
      canUnGroup: boolean;
      canGroup: boolean;
      nodes: WeaveSelection[];
    }): ContextMenuOption[] => {
      if (!instance) return [];

      const options: ContextMenuOption[] = [];

      const singleLocked =
        nodes.length === 1 && nodes[0].instance.getAttrs().locked;

      if (nodes.length > 0) {
        if (
          nodes.length === 1 &&
          ["image"].includes(nodes[0].node?.type ?? "") &&
          !singleLocked
        ) {
          options.push({
            id: "removeBackground",
            type: "button",
            label: "Remove image background",
            icon: <Bot size={16} />,
            onClick: () => {
              if (instance) {
                const nodeImage = nodes[0].instance as Konva.Group | undefined;
                if (nodeImage) {
                  const nodeImageInternal = nodeImage?.findOne(
                    `#${nodeImage.getAttrs().id}-image`
                  );
                  const imageTokens = nodeImageInternal
                    ?.getAttr("image")
                    .src.split("/");
                  const imageId = imageTokens[imageTokens.length - 1];
                  setTransformingImage(true);
                  mutationUpload.mutate(imageId, {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onSuccess: (data: any) => {
                      const room = data.fileName.split("/")[0];
                      const imageId = data.fileName.split("/")[1];

                      const { finishUploadCallback } = instance.triggerAction(
                        "imageTool"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ) as any;

                      instance.updatePropsAction("imageTool", { imageId });

                      finishUploadCallback(
                        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
                      );
                    },
                    onError: () => {
                      console.error("Error uploading image");
                    },
                    onSettled: () => {
                      setTransformingImage(false);
                    },
                  });
                }
              }
              setContextMenuShow(false);
            },
          });
        }
        // EDIT IMAGE WITH A PROMPT
        if (!singleLocked) {
          options.push({
            id: "editIAImage",
            type: "button",
            disabled: !aiEnabled,
            label: "Edit with AI",
            icon: <Bot size={16} />,
            onClick: async () => {
              const base64URL: unknown = await instance.triggerAction<
                WeaveExportNodesActionParams,
                void
              >("exportNodesTool", {
                nodes: nodes.map((n) => n.instance),
                options: {
                  padding: 0,
                  pixelRatio: 1,
                },
                download: false,
              });

              setImagesLLMPopupSelectedNodes(nodes.map((n) => n.instance));
              setImagesLLMPopupType("edit-prompt");
              setImagesLLMPopupImage(base64URL as string);
              setImagesLLMPopupVisible(true);
              setContextMenuShow(false);
            },
          });
          options.push({
            id: "div--1",
            type: "divider",
          });
        }
        if (!singleLocked) {
          // EXPORT
          options.push({
            id: "export",
            type: "button",
            label: (
              <div className="w-full flex justify-between items-center">
                <div>Export as image</div>
                <ShortcutElement
                  shortcuts={{
                    [SYSTEM_OS.MAC]: "⇧ ⌘ E",
                    [SYSTEM_OS.OTHER]: "⇧ Ctrl E",
                  }}
                />
              </div>
            ),
            icon: <ImageDown size={16} />,
            disabled: nodes.length <= 0,
            onClick: () => {
              instance.triggerAction<WeaveExportNodesActionParams, void>(
                "exportNodesTool",
                {
                  nodes: nodes.map((n) => n.instance),
                  options: {
                    padding: 20,
                    pixelRatio: 2,
                  },
                }
              );
              setContextMenuShow(false);
            },
          });
          // SEPARATOR
          options.push({
            id: "div-0",
            type: "divider",
          });
        }

        if (!singleLocked) {
          // COPY
          options.push({
            id: "copy",
            type: "button",
            label: (
              <div className="w-full flex justify-between items-center">
                <div>Copy</div>
                <ShortcutElement
                  shortcuts={{
                    [SYSTEM_OS.MAC]: "⌘ C",
                    [SYSTEM_OS.OTHER]: "Ctrl C",
                  }}
                />
              </div>
            ),
            icon: <ClipboardCopy size={16} />,
            disabled: !["selectionTool"].includes(actActionActive ?? ""),
            onClick: async () => {
              const weaveCopyPasteNodesPlugin =
                instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
              if (weaveCopyPasteNodesPlugin) {
                await weaveCopyPasteNodesPlugin.copy();
              }
              setContextMenuShow(false);
            },
          });
        }
      }
      // PASTE
      options.push({
        id: "paste",
        type: "button",
        label: (
          <div className="w-full flex justify-between items-center">
            <div>Paste</div>
            <ShortcutElement
              shortcuts={{
                [SYSTEM_OS.MAC]: "⌘ P",
                [SYSTEM_OS.OTHER]: "Ctrl P",
              }}
            />
          </div>
        ),
        icon: <ClipboardPaste size={16} />,
        disabled: !["selectionTool"].includes(actActionActive ?? ""),
        onClick: async () => {
          const weaveCopyPasteNodesPlugin =
            instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
          if (weaveCopyPasteNodesPlugin) {
            await weaveCopyPasteNodesPlugin.paste();
            setContextMenuShow(false);
          }
        },
      });
      if (!singleLocked && nodes.length > 0) {
        // SEPARATOR
        options.push({
          id: "div-1",
          type: "divider",
        });
      }
      if (!singleLocked && nodes.length > 0) {
        // BRING TO FRONT
        options.push({
          id: "bring-to-front",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Bring to front</div>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "]",
                  [SYSTEM_OS.OTHER]: "]",
                }}
              />
            </div>
          ),
          icon: <BringToFront size={16} />,
          onClick: () => {
            instance.bringToFront(nodes.map((n) => n.instance));
            setContextMenuShow(false);
          },
        });
        // MOVE UP
        options.push({
          id: "move-up",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Move up</div>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⌘ ]",
                  [SYSTEM_OS.OTHER]: "Ctrl ]",
                }}
              />
            </div>
          ),
          icon: <ArrowUp size={16} />,
          disabled: nodes.length !== 1,
          onClick: () => {
            instance.moveUp(nodes[0].instance);
            setContextMenuShow(false);
          },
        });
        // MOVE DOWN
        options.push({
          id: "move-down",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Move down</div>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⌘ [",
                  [SYSTEM_OS.OTHER]: "Ctrl [",
                }}
              />
            </div>
          ),
          icon: <ArrowDown size={16} />,
          disabled: nodes.length !== 1,
          onClick: () => {
            instance.moveDown(nodes[0].instance);
            setContextMenuShow(false);
          },
        });
        // SEND TO BACK
        options.push({
          id: "send-to-back",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Send to back</div>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "[",
                  [SYSTEM_OS.OTHER]: "[",
                }}
              />
            </div>
          ),
          icon: <SendToBack size={16} />,
          onClick: () => {
            instance.sendToBack(nodes.map((n) => n.instance));
            setContextMenuShow(false);
          },
        });
      }
      if (!singleLocked && nodes.length > 0) {
        options.push({
          id: "div-2",
          type: "divider",
        });
      }
      if (!singleLocked && nodes.length > 0) {
        // GROUP
        options.push({
          id: "group",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Group</div>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⇧ ⌘ G",
                  [SYSTEM_OS.OTHER]: "⇧ Ctrl G",
                }}
              />
            </div>
          ),
          icon: <Group size={16} />,
          disabled: !canGroup,
          onClick: () => {
            instance.group(
              nodes
                .map((n) => n?.node)
                .filter((node) => typeof node !== "undefined")
            );
            setContextMenuShow(false);
          },
        });
        // UNGROUP
        options.push({
          id: "ungroup",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Un-group</div>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "⇧ ⌘ U",
                  [SYSTEM_OS.OTHER]: "⇧ Ctrl U",
                }}
              />
            </div>
          ),
          icon: <Ungroup size={16} />,
          disabled: !canUnGroup,
          onClick: () => {
            if (nodes[0].node) {
              instance.unGroup(nodes[0].node);
              setContextMenuShow(false);
            }
          },
        });
      }
      if (nodes.length > 0) {
        // SEPARATOR
        options.push({
          id: "div-3",
          type: "divider",
        });
      }
      if (nodes.length > 0) {
        // LOCK / UNLOCK
        options.push({
          id: "lock-unlock",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Lock / Unlock</div>
            </div>
          ),
          icon: <Lock size={16} />,
          onClick: () => {
            if (!instance) return;

            for (const node of nodes) {
              const isLocked = instance.allNodesLocked([node.instance]);

              if (!isLocked) {
                instance.lockNode(node.instance);
                continue;
              }
              if (isLocked) {
                instance.unlockNode(node.instance);
              }
            }

            setContextMenuShow(false);
          },
        });
        // HIDE
        options.push({
          id: "show-hide",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Hide</div>
            </div>
          ),
          icon: <EyeOff size={16} />,
          onClick: () => {
            if (!instance) return;

            for (const node of nodes) {
              const isVisible = instance.allNodesVisible([node.instance]);

              if (isVisible) {
                instance.hideNode(node.instance);
              }
            }

            setContextMenuShow(false);
          },
        });
      }
      if (!singleLocked && nodes.length > 0) {
        // SEPARATOR
        options.push({
          id: "div-4",
          type: "divider",
        });
      }
      if (!singleLocked && nodes.length > 0) {
        // DELETE
        options.push({
          id: "delete",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Delete</div>
              <ShortcutElement
                shortcuts={{
                  [SYSTEM_OS.MAC]: "Del",
                  [SYSTEM_OS.OTHER]: "Del",
                }}
              />
            </div>
          ),
          icon: <Trash size={16} />,
          onClick: () => {
            for (const node of nodes) {
              if (node.node) {
                instance.removeNode(node.node);
              }
            }

            setContextMenuShow(false);
          },
        });
      }

      return options;
    },
    [
      instance,
      mutationUpload,
      aiEnabled,
      setImagesLLMPopupSelectedNodes,
      setImagesLLMPopupType,
      setImagesLLMPopupVisible,
      setImagesLLMPopupImage,
      setTransformingImage,
      setContextMenuShow,
    ]
  );

  const onNodeContextMenuHandler = React.useCallback(
    ({
      selection,
      point,
      visible,
    }: WeaveStageContextMenuPluginOnNodeContextMenuEvent) => {
      if (!instance) return;

      const canGroup = selection.length > 1;
      const canUnGroup =
        selection.length === 1 && (selection[0]?.node?.type ?? "") === "group";

      const actActionActive = instance.getActiveAction();

      setContextMenuShow(visible);
      setContextMenuPosition(point);

      const contextMenu = getContextMenu({
        actActionActive,
        canUnGroup,
        nodes: selection,
        canGroup,
      });
      setContextMenuOptions(contextMenu);
    },
    [
      instance,
      getContextMenu,
      setContextMenuOptions,
      setContextMenuPosition,
      setContextMenuShow,
    ]
  );

  React.useEffect(() => {
    if (!instance) return;

    instance.addEventListener("onNodeContextMenu", onNodeContextMenuHandler);

    return () => {
      instance.removeEventListener(
        "onNodeContextMenu",
        onNodeContextMenuHandler
      );
    };
  }, [instance, onNodeContextMenuHandler]);
}

export default useContextMenu;
