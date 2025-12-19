// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { toast } from "sonner";
import {
  WeaveContextMenuPlugin,
  WeaveCopyPasteNodesPlugin,
  WeaveStageContextMenuPluginOnNodeContextMenuEvent,
} from "@inditextech/weave-sdk";
import { Vector2d } from "konva/lib/types";
import { WeaveElementInstance, WeaveSelection } from "@inditextech/weave-types";
import { useCollaborationRoom } from "@/store/store";
import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { ContextMenuOption } from "../context-menu";
import { ShortcutElement } from "../help/shortcut-element";
import { SYSTEM_OS } from "@/lib/utils";
import {
  ClipboardCopy,
  ClipboardPaste,
  Group,
  Ungroup,
  Trash,
  SendToBack,
  BringToFront,
  ArrowUp,
  ArrowDown,
  ImageDown,
  Lock,
  EyeOff,
  Link,
  PackagePlus,
  PackageOpen,
  Paperclip,
} from "lucide-react";
import { useExportToImageServerSide } from "./use-export-to-image-server-side";
import { getImageBase64 } from "@/components/utils/images";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";
import { setTemplateOnPosition } from "@/components/utils/templates";
import { useTemplates } from "@/store/templates";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import { useIAChat } from "@/store/ia-chat";

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
  const setExportNodes = useCollaborationRoom((state) => state.setExportNodes);
  const setExportConfigVisible = useCollaborationRoom(
    (state) => state.setExportConfigVisible
  );

  const linkedNode = useCollaborationRoom((state) => state.linkedNode);
  const setLinkedNode = useCollaborationRoom((state) => state.setLinkedNode);

  const aiChatEnabled = useIAChat((state) => state.enabled);

  const setSaveDialogVisible = useTemplates(
    (state) => state.setSaveDialogVisible
  );

  const { isExporting } = useExportToImageServerSide();

  const promptInputAttachmentsController = usePromptInputAttachments();

  // const mutationUpload = useMutation({
  //   mutationFn: async ({
  //     imageId,
  //     image,
  //   }: {
  //     imageId: string;
  //     image: { dataBase64: string; contentType: string };
  //   }) => {
  //     return await postRemoveBackground(room ?? "", imageId, image);
  //   },
  // });

  // const mutationUploadV2 = useMutation({
  //   mutationFn: async ({
  //     userId,
  //     clientId,
  //     imageId,
  //     image,
  //   }: {
  //     userId: string;
  //     clientId: string;
  //     imageId: string;
  //     image: {
  //       dataBase64: string;
  //       contentType: string;
  //     };
  //   }) => {
  //     return await postRemoveBackgroundV2(
  //       userId,
  //       clientId,
  //       room ?? "",
  //       imageId,
  //       image
  //     );
  //   },
  // });

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
    async ({
      actActionActive,
      canUnGroup,
      nodes,
      canGroup,
      clickPoint,
      stageClickPoint,
    }: {
      actActionActive: string | undefined;
      canUnGroup: boolean;
      canGroup: boolean;
      nodes: WeaveSelection[];
      clickPoint: Vector2d;
      stageClickPoint: Vector2d;
    }): Promise<ContextMenuOption[]> => {
      if (!instance) return [];

      const options: ContextMenuOption[] = [];

      const singleLocked =
        nodes.length === 1 && nodes[0].instance.getAttrs().locked;

      const isSingleImage =
        nodes.length === 1 && nodes[0].node?.type === "image";
      const isSingleImageTemplate =
        nodes.length === 1 && nodes[0].node?.type === "image-template";

      const hasLinkedImageNode =
        linkedNode !== null && linkedNode.getAttrs().nodeType === "image";

      if (nodes.length > 0 && aiChatEnabled) {
        // LINK IMAGE AS ATTACHMENT TOOLS
        // if (isSingleImage) {
        options.push({
          id: "set-prompt-attachment-image",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Set as prompt attachment</div>
            </div>
          ),
          icon: <Paperclip size={16} />,
          onClick: async () => {
            setContextMenuShow(false);

            const id = toast.loading("Generating attachment...");

            const selectionImage = await getImageBase64({
              instance,
              nodes: nodes.map((n) => n.node?.key ?? ""),
              options: {
                format: "image/png",
                padding: 0,
                backgroundColor: "transparent",
                pixelRatio: 1,
              },
            });

            const [header, base64] = selectionImage.url.split(",");
            const mime = header.match(/:(.*?);/)![1];

            const binary = atob(base64);
            const len = binary.length;
            const bytes = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
              bytes[i] = binary.charCodeAt(i);
            }

            const selectionBlob = new Blob([bytes], { type: mime });

            const file = new File([selectionBlob], "image.png", {
              type: mime,
            });

            promptInputAttachmentsController.add([file]);

            toast.dismiss(id);
          },
        });
        // LINK IMAGE TOOLS
        if (isSingleImage) {
          options.push({
            id: "set-linked-image",
            type: "button",
            label: (
              <div className="w-full flex justify-between items-center">
                <div>Set as template link</div>
              </div>
            ),
            icon: <Link size={16} />,
            onClick: async () => {
              setLinkedNode(nodes[0].instance);
              setContextMenuShow(false);
              toast.success("Image set as template link.");
            },
          });
          // SEPARATOR
          options.push({
            id: "div-link-image-tools",
            type: "divider",
          });
        }

        // IMAGE TEMPLATE TOOLS
        if (isSingleImageTemplate && hasLinkedImageNode) {
          options.push({
            id: "set-image-link",
            type: "button",
            label: (
              <div className="w-full flex justify-between items-center">
                <div>Link image</div>
              </div>
            ),
            icon: <Link size={16} />,
            onClick: async () => {
              if (!instance) return;

              const handler =
                instance.getNodeHandler<ImageTemplateNode>("image-template");

              if (handler) {
                handler.setImage(
                  nodes[0].instance,
                  linkedNode as WeaveElementInstance
                );
              }

              setLinkedNode(null);
              setContextMenuShow(false);
            },
          });
          // SEPARATOR
          options.push({
            id: "div-image-template-tools",
            type: "divider",
          });
        }

        if (!singleLocked) {
          // EXPORT ON THE SERVER
          options.push({
            id: "export-server",
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
            disabled: nodes.length <= 0 || isExporting,
            onClick: async () => {
              setExportNodes(nodes.map((n) => n.node?.key ?? ""));
              setExportConfigVisible(true);
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
          // SAVE AS TEMPLATE
          options.push({
            id: "save-as-template",
            type: "button",
            label: (
              <div className="w-full flex justify-between items-center">
                <div>Save as template</div>
              </div>
            ),
            icon: <PackagePlus size={16} />,
            disabled: !["selectionTool"].includes(actActionActive ?? ""),
            onClick: () => {
              setSaveDialogVisible(true);
              setContextMenuShow(false);
            },
          });
        }
        options.push({
          id: "create-template-instance",
          type: "button",
          label: (
            <div className="w-full flex justify-between items-center">
              <div>Add template instance here</div>
            </div>
          ),
          icon: <PackageOpen size={16} />,
          disabled: !sessionStorage.getItem(`weave.js_${room}_template`),
          onClick: () => {
            if (!instance) return;
            const templateString = sessionStorage.getItem(
              `weave.js_${room}_template`
            );
            setTemplateOnPosition(
              instance,
              templateString ? JSON.parse(templateString) : {},
              clickPoint,
              stageClickPoint
            );
          },
        });
        options.push({
          id: "div-templates",
          type: "divider",
        });

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
          options.push({
            id: "copy-as-image",
            type: "button",
            label: (
              <div className="w-full flex justify-between items-center">
                <div>Copy as image</div>
              </div>
            ),
            icon: <ClipboardCopy size={16} />,
            disabled: !["selectionTool"].includes(actActionActive ?? ""),
            onClick: async () => {
              setContextMenuShow(false);
              const weaveCopyPasteNodesPlugin =
                instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
              if (weaveCopyPasteNodesPlugin) {
                await weaveCopyPasteNodesPlugin.copy(true);
              }
            },
          });
        }
      }
      options.push({
        id: "paste",
        type: "button",
        label: (
          <div className="w-full flex justify-between items-center">
            <div>Paste here</div>
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
        onClick: () => {
          const weaveCopyPasteNodesPlugin =
            instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
          if (weaveCopyPasteNodesPlugin) {
            weaveCopyPasteNodesPlugin.paste(clickPoint, stageClickPoint);
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
      aiChatEnabled,
      promptInputAttachmentsController,
      setLinkedNode,
      setSaveDialogVisible,
      setExportConfigVisible,
      setExportNodes,
      isExporting,
      setContextMenuShow,
      room,
      linkedNode,
    ]
  );

  const onNodeContextMenuHandler = React.useCallback(
    async ({
      selection,
      contextMenuPoint,
      clickPoint,
      stageClickPoint,
      visible,
    }: WeaveStageContextMenuPluginOnNodeContextMenuEvent) => {
      if (!instance) return;

      if (!visible) return;

      const canGroup = selection.length > 1;
      const canUnGroup =
        selection.length === 1 && (selection[0]?.node?.type ?? "") === "group";

      const actActionActive = instance.getActiveAction();

      const contextMenu = await getContextMenu({
        actActionActive,
        canUnGroup,
        nodes: selection,
        canGroup,
        clickPoint,
        stageClickPoint,
      });

      if (contextMenu.length > 0) {
        setContextMenuShow(visible);
        setContextMenuPosition(contextMenuPoint);
        setContextMenuOptions(contextMenu);
      } else {
        const contextMenuPlugin =
          instance?.getPlugin<WeaveContextMenuPlugin>("contextMenu");
        contextMenuPlugin?.closeContextMenu();
      }
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
