// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { TreeView, TreeDataItem } from "@/components/ui/tree-view";
import {
  WeaveSelection,
  WeaveStateElement,
  WeaveUser,
  WeaveUserMutexLock,
} from "@inditextech/weave-types";
import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import {
  Frame,
  Spline,
  Image,
  Square,
  Tag,
  Type,
  Trash,
  LockOpen,
  Lock,
  Circle,
  Hexagon,
  Star,
  MoveUpRight,
  Eye,
  EyeOff,
  Group,
  LineSquiggle,
  LayoutPanelTop,
  ChevronsLeftRightEllipsis,
  Ruler,
  Video,
  Focus,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Weave,
  WeaveNodesSelectionPlugin,
  WeaveStageZoomPlugin,
} from "@inditextech/weave-sdk";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSelector } from "../sidebar-selector";
import { SidebarHeader } from "../sidebar-header";
import { OPERATIONS_MAP } from "@/components/utils/constants";
import { stringToColor } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconsMap: Record<string, any> = {
  rectangle: Square,
  text: Type,
  image: Image,
  frame: Frame,
  group: Group,
  video: Video,
  "color-token": Tag,
  connector: ChevronsLeftRightEllipsis,
  line: Spline,
  stroke: LineSquiggle,
  "regular-polygon": Hexagon,
  "image-template": LayoutPanelTop,
  ellipse: Circle,
  star: Star,
  arrow: MoveUpRight,
  measure: Ruler,
};

function mapElementsToTree(
  instance: Weave,
  elements: WeaveStateElement[],
  lockedNodes: Record<string, { user: WeaveUser; operation: string }>,
  selectedNodes: string[]
) {
  const elementsMapped = elements.map((element) => {
    return {
      id: element.key,
      icon: iconsMap[element.props.nodeType ?? "rectangle"],
      name: element.props.nodeName ? element.props.nodeName : element.key,
      lockInfo: lockedNodes[element.key],
      disabled: Boolean(lockedNodes[element.key]),
      status: [
        <div key="trash" className="px-1">
          <Trash stroke="transparent" size={16} strokeWidth={1} />
        </div>,
        <div key="visibility" className="bg-white px-1 rounded-none">
          <Eye
            stroke={
              typeof element.props.visible === "undefined" ||
              element.props.visible
                ? "transparent"
                : "black"
            }
            size={16}
            strokeWidth={1}
          />
        </div>,
        <div key="locked" className="bg-white px-1 rounded-none">
          <Lock
            stroke={element.props.locked ? "black" : "transparent"}
            size={16}
            strokeWidth={1}
          />
        </div>,
      ],
      disabledActions: [
        <HoverCard key="locked-info">
          <HoverCardTrigger asChild>
            <div className="px-1 text-[10px] flex gap-1 justify-end items-center">
              <div
                className="w-[16px] h-[16px] border border-[#c9c9c9]"
                style={{
                  backgroundColor: stringToColor(
                    lockedNodes[element.key]?.user.name ?? ""
                  ),
                }}
              ></div>
              <div>operating</div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent
            align="end"
            side="bottom"
            className="w-auto rounded-none shadow-none border-[#c9c9c9] text-xs font-inter px-3 py-2"
          >
            <div className="w-full grid grid-cols-2">
              <div className="border-b py-2 pr-2">Operated by</div>
              <div className="flex justify-end items-center gap-2 border-b py-2 pl-2">
                <div className="text-right">
                  <b>{lockedNodes[element.key]?.user.name}</b>
                </div>
                <div
                  className="w-[16px] h-[16px] border border-[#c9c9c9]"
                  style={{
                    backgroundColor: stringToColor(
                      lockedNodes[element.key]?.user.name ?? ""
                    ),
                  }}
                ></div>
              </div>
              <div className="py-2 pr-2">Operation</div>
              <div className="text-right py-2 pl-2">
                <b>{OPERATIONS_MAP[lockedNodes[element.key]?.operation]}</b>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>,
        <div
          key="focus"
          tabIndex={0}
          role="button"
          className="bg-white p-1 cursor-pointer hover:bg-zinc-950 hover:text-white rounded-none"
          onClick={(e) => {
            e.stopPropagation();
            if (!instance) return;

            const stageZoomPlugin =
              instance.getPlugin<WeaveStageZoomPlugin>("stageZoom");
            if (stageZoomPlugin) {
              stageZoomPlugin.fitToNodes([element.key], true);
            }
          }}
        >
          <Focus size={16} strokeWidth={1} />
        </div>,
      ],
      actions: [
        <div
          key="remove"
          tabIndex={0}
          role="button"
          className="bg-white p-1 cursor-pointer hover:bg-zinc-950 hover:text-white rounded-none"
          onClick={(e) => {
            e.stopPropagation();
            const nodesSelectionPlugin =
              instance?.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
            if (instance && nodesSelectionPlugin) {
              instance.selectNodesByKey([element.key]);
              nodesSelectionPlugin.removeSelectedNodes();
            }
          }}
        >
          <Trash size={16} strokeWidth={1} />
        </div>,
        <div
          key="show-hidden"
          tabIndex={0}
          role="button"
          className="bg-white p-1 cursor-pointer hover:bg-zinc-950 hover:text-white rounded-none"
          onClick={(e) => {
            e.stopPropagation();
            if (!instance) return;

            const elementNode = instance.getStage().findOne(`#${element.key}`);

            if (!elementNode) return;

            const isVisible = instance.allNodesVisible([elementNode]);

            if (!isVisible) {
              instance.showNode(elementNode);
              return;
            }
            if (isVisible) {
              instance.hideNode(elementNode);
            }
          }}
        >
          {typeof element.props.visible === "undefined" ||
          element.props.visible ? (
            <EyeOff size={16} strokeWidth={1} />
          ) : (
            <Eye size={16} strokeWidth={1} />
          )}
        </div>,
        <div
          key="lock-unlock"
          tabIndex={0}
          role="button"
          className="bg-white p-1 cursor-pointer hover:bg-zinc-950 hover:text-white rounded-none"
          onClick={(e) => {
            e.stopPropagation();
            if (!instance) return;

            const elementNode = instance.getStage().findOne(`#${element.key}`);

            if (!elementNode) return;

            const isLocked = instance.allNodesLocked([elementNode]);

            if (!isLocked) {
              instance.lockNode(elementNode);
              return;
            }
            if (isLocked) {
              instance.unlockNode(elementNode);
            }
          }}
        >
          {element.props.locked ? (
            <LockOpen size={16} strokeWidth={1} />
          ) : (
            <Lock size={16} strokeWidth={1} />
          )}
        </div>,
      ],
      ...((element.props.children ?? []).length > 0 && {
        children: mapElementsToTree(
          instance,
          element.props.children ?? [],
          lockedNodes,
          selectedNodes
        ),
      }),
    } as TreeDataItem;
  }) as TreeDataItem[];

  return elementsMapped;
}

export const ElementsTree = () => {
  const instance = useWeave((state) => state.instance);
  const initialSelectedNodes = useWeave((state) => state.selection.nodes);
  const usersLocks = useWeave((state) => state.usersLocks);

  const user = useCollaborationRoom((state) => state.user);

  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);

  const [elementsTree, setElementsTree] = React.useState<WeaveStateElement[]>(
    []
  );
  const [selectedNodes, setSelectedNodes] = React.useState<string[]>(
    initialSelectedNodes
      .map((node) => node.node?.key)
      .filter((key) => typeof key !== "undefined")
  );

  const amountOfNodes = React.useMemo(() => {
    let amountNodes = 0;

    for (const element of elementsTree) {
      if (element.props.children && element.props.children.length > 0) {
        amountNodes += element.props.children.length;
      }
      amountNodes++;
    }
    return amountNodes;
  }, [elementsTree]);

  React.useEffect(() => {
    function handleOnStateChange() {
      if (!instance) return [];

      const nodesTree = instance.getElementsTree();
      setElementsTree(nodesTree);
    }

    if (instance) {
      instance.addEventListener("onStateChange", handleOnStateChange);
      setElementsTree(instance.getElementsTree());
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onStateChange", handleOnStateChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarActive]);

  React.useEffect(() => {
    function handleOnNodesSelectedChange(nodes: WeaveSelection[]) {
      setSelectedNodes(
        nodes
          .map((node) => node.node?.key)
          .filter((key) => typeof key !== "undefined")
      );
    }

    if (instance) {
      instance.addEventListener("onNodesChange", handleOnNodesSelectedChange);
    }

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onNodesChange",
          handleOnNodesSelectedChange
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarActive]);

  const lockedNodes: Record<string, { user: WeaveUser; operation: string }> =
    React.useMemo(() => {
      const users = Object.keys(usersLocks || {});

      const lockedNodes: Record<
        string,
        { user: WeaveUser; operation: string }
      > = {};
      for (const userId of users) {
        if (userId === user?.id) continue;

        const userLock = usersLocks[userId] as WeaveUserMutexLock<unknown>;

        for (const nodeId of userLock.nodeIds) {
          lockedNodes[nodeId] = {
            user: userLock.user,
            operation: userLock.operation,
          };
        }
      }

      return lockedNodes;
    }, [user, usersLocks]);

  const treeData = React.useMemo<TreeDataItem[]>(() => {
    if (!instance) return [];

    return mapElementsToTree(
      instance,
      elementsTree,
      lockedNodes,
      selectedNodes
    );
  }, [instance, elementsTree, lockedNodes, selectedNodes]);

  if (!instance) {
    return null;
  }

  if (sidebarActive !== SIDEBAR_ELEMENTS.nodesTree) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <SidebarHeader>
        <SidebarSelector title="Elements Tree" />
      </SidebarHeader>
      <ScrollArea className="w-full h-[calc(100%-95px-33px)]">
        <div className="flex flex-col gap-2 w-full h-full">
          {elementsTree.length === 0 && (
            <div className="col-span-2 w-full mt-[24px] flex flex-col justify-center items-center text-sm text-center font-inter font-light">
              <b className="font-normal text-[18px]">No elements created</b>
              <span className="text-[14px]">
                Add an element to the whiteboard
              </span>
            </div>
          )}
          {elementsTree.length > 0 && (
            <TreeView
              data={treeData}
              initialSelectedItems={selectedNodes}
              onSelectedItemsChange={(items: string[]) => {
                const stage = instance.getStage();

                const node = stage.findOne(`#${items[0]}`);
                if (
                  node &&
                  !instance.allNodesLocked([node]) &&
                  instance.allNodesVisible([node])
                ) {
                  instance.selectNodesByKey(items);
                }
              }}
            />
          )}
        </div>
      </ScrollArea>
      <div className="px-[24px] py-[8px] text-xs border-t border-[#c9c9c9]">
        Nodes: {amountOfNodes}
      </div>
    </div>
  );
};
