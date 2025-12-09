// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { create } from "zustand";
import { ContextMenuOption } from "@/components/room-components/context-menu";
import { WeaveElementAttributes } from "@inditextech/weave-types";
import { DRAWER_ELEMENTS, SIDEBAR_ELEMENTS } from "@/lib/constants";

type ShowcaseUser = {
  id: string;
  name: string;
  email: string;
};

type NodePropertiesAction = "create" | "update" | undefined;

type CommentsStatus = "pending" | "resolved" | "all";

export const BACKGROUND_COLOR = {
  ["WHITE"]: "#FFFFFF",
  ["GRAY"]: "#D6D6D6",
} as const;

export type BackgroundColor =
  (typeof BACKGROUND_COLOR)[keyof typeof BACKGROUND_COLOR];

export type TransformingOperation =
  | "background-removal"
  | "negate-image"
  | "flip-horizontal-image"
  | "flip-vertical-image"
  | "grayscale-image"
  | "image-generation"
  | "image-edition"
  | undefined;

type FinishUploadCallback = (imageURL: string) => void;

type DrawerKeyKeys = keyof typeof DRAWER_ELEMENTS;
export type DrawerKey = (typeof DRAWER_ELEMENTS)[DrawerKeyKeys];

type SidebarActiveKeys = keyof typeof SIDEBAR_ELEMENTS;
export type SidebarActive = (typeof SIDEBAR_ELEMENTS)[SidebarActiveKeys] | null;

interface CollaborationRoomState {
  backgroundColor: BackgroundColor;
  features: {
    workloads: boolean;
    threads: boolean;
  };
  fetchConnectionUrl: {
    loading: boolean;
    error: Error | null;
  };
  linkedNode: Konva.Node | null;
  fonts: {
    loaded: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: { id: string; name: string }[];
  };
  ui: {
    show: boolean;
    minimap: boolean;
  };
  connection: {
    tests: {
      show: boolean;
    };
  };
  drawer: {
    keyboardShortcuts: {
      visible: boolean;
    };
  };
  sidebar: {
    previouslyActive: SidebarActive;
    active: SidebarActive;
  };
  clientId: string | undefined;
  user: ShowcaseUser | undefined;
  room: string | undefined;
  contextMenu: {
    show: boolean;
    position: Vector2d;
    options: ContextMenuOption[];
  };
  nodeProperties: {
    action: NodePropertiesAction;
    createProps: WeaveElementAttributes | undefined;
  };
  commBus: {
    connected: boolean;
  };
  export: {
    nodes: string[]; // node ids
    config: {
      visible: boolean;
    };
  };
  comments: {
    status: CommentsStatus;
  };
  videos: {
    showSelectFile: boolean;
    uploading: boolean;
  };
  images: {
    showSelectFiles: boolean;
    showSelectFile: boolean;
    transforming: boolean;
    transformingOperation: TransformingOperation;
    cropping: {
      enabled: boolean;
      node: Konva.Node | undefined;
    };
    exporting: boolean;
    uploading: boolean;
    loading: boolean;
    finishUploadCallback: FinishUploadCallback | null;
    removeBackgroundPopup: {
      originNodeId?: string;
      originImage?: string;
      imageId?: string;
      imageURL?: string;
      action: "replace" | "new" | undefined;
      show: boolean;
    };
  };
  setShowUi: (newShowUI: boolean) => void;
  setShowMinimap: (newShowMinimap: boolean) => void;
  setFetchConnectionUrlLoading: (newLoading: boolean) => void;
  setFetchConnectionUrlError: (
    newFetchConnectionUrlError: Error | null
  ) => void;
  setClientId: (newClientId: string | undefined) => void;
  setUser: (newUser: ShowcaseUser | undefined) => void;
  setRoom: (newRoom: string | undefined) => void;
  setContextMenuShow: (newContextMenuShow: boolean) => void;
  setContextMenuPosition: (newContextMenuPosition: Vector2d) => void;
  setContextMenuOptions: (newContextMenuOptions: ContextMenuOption[]) => void;
  setTransformingImage: (
    newTransformingImage: boolean,
    operation?: TransformingOperation
  ) => void;
  setCroppingImage: (newCroppingImage: boolean) => void;
  setCroppingNode: (newCroppingNode: Konva.Node | undefined) => void;
  setUploadingVideo: (newUploadingVideo: boolean) => void;
  setShowSelectFileVideo: (newShowSelectFileVideo: boolean) => void;
  setUploadingImage: (newUploadingImage: boolean) => void;
  setShowSelectFilesImages: (newShowSelectFilesImages: boolean) => void;
  setShowSelectFileImage: (newShowSelectFileImage: boolean) => void;
  setLoadingImage: (newLoadingImage: boolean) => void;
  setFinishUploadCallbackImage: (
    newFinishUploadCallbackImage: FinishUploadCallback | null
  ) => void;
  setNodePropertiesAction: (
    newNodePropertiesAction: NodePropertiesAction
  ) => void;
  setNodePropertiesCreateProps: (
    newNodePropertiesCreateProps: WeaveElementAttributes | undefined
  ) => void;
  setSidebarActive: (newSidebarActive: SidebarActive) => void;
  setShowDrawer: (drawerKey: DrawerKey, newOpen: boolean) => void;
  setRemoveBackgroundPopupAction: (
    newAction: "replace" | "new" | undefined
  ) => void;
  setRemoveBackgroundPopupShow: (newShow: boolean) => void;
  setRemoveBackgroundPopupOriginImage: (
    newOriginImage: string | undefined
  ) => void;
  setRemoveBackgroundPopupOriginNodeId: (
    newOriginNodeId: string | undefined
  ) => void;
  setRemoveBackgroundPopupImageId: (newImageId: string | undefined) => void;
  setRemoveBackgroundPopupImageURL: (newImageURL: string | undefined) => void;
  setCommBusConnected: (newConnected: boolean) => void;
  setImageExporting: (newExportingImage: boolean) => void;
  setCommentsStatus: (newStatus: CommentsStatus) => void;
  setExportNodes: (newNodes: string[]) => void;
  setExportConfigVisible: (newVisible: boolean) => void;
  setFontsLoaded: (newLoaded: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFontsValues: (newValues: { id: string; name: string }[]) => void;
  setConnectionTestsShow: (newShow: boolean) => void;
  setBackgroundColor: (newBackgroundColor: BackgroundColor) => void;
  setLinkedNode: (newLinkedNode: Konva.Node | null) => void;
}

export const useCollaborationRoom = create<CollaborationRoomState>()((set) => ({
  backgroundColor: BACKGROUND_COLOR.GRAY,
  linkedNode: null,
  features: {
    workloads: true,
    threads: true,
  },
  connection: {
    tests: {
      show: false,
    },
  },
  ui: {
    show: true,
    minimap: false,
  },
  fetchConnectionUrl: {
    loading: false,
    error: null,
  },
  clientId: undefined,
  user: undefined,
  room: undefined,
  sidebar: {
    previouslyActive: null,
    active: SIDEBAR_ELEMENTS.nodesTree,
  },
  fonts: {
    loaded: false,
    values: [],
  },
  drawer: {
    keyboardShortcuts: {
      visible: false,
    },
  },
  contextMenu: {
    show: false,
    position: { x: 0, y: 0 },
    options: [],
  },
  nodeProperties: {
    action: undefined,
    visible: false,
    createProps: undefined,
  },
  commBus: {
    connected: false,
  },
  export: {
    nodes: [],
    config: {
      visible: false,
    },
  },
  videos: {
    showSelectFile: false,
    uploading: false,
  },
  images: {
    showSelectFiles: false,
    showSelectFile: false,
    transforming: false,
    transformingOperation: undefined,
    cropping: {
      enabled: false,
      node: undefined,
    },
    exporting: false,
    uploading: false,
    loading: false,
    finishUploadCallback: null,
    removeBackgroundPopup: {
      originNodeId: undefined,
      imageId: undefined,
      imageURL: undefined,
      action: undefined,
      show: false,
    },
  },
  frames: {
    library: {
      visible: false,
    },
  },
  colorToken: {
    library: {
      visible: false,
    },
  },
  comments: {
    status: "pending",
  },
  nodesTree: {
    visible: false,
  },
  setShowUi: (newShowUI) =>
    set((state) => ({
      ...state,
      ui: { ...state.ui, show: newShowUI },
    })),
  setShowMinimap: (newShowMinimap) =>
    set((state) => ({
      ...state,
      ui: { ...state.ui, minimap: newShowMinimap },
    })),
  setFetchConnectionUrlLoading: (newLoading) =>
    set((state) => ({
      ...state,
      fetchConnectionUrl: { ...state.fetchConnectionUrl, loading: newLoading },
    })),
  setFetchConnectionUrlError: (newFetchConnectionUrlError) =>
    set((state) => ({
      ...state,
      fetchConnectionUrl: {
        ...state.fetchConnectionUrl,
        error: newFetchConnectionUrlError,
      },
    })),
  setClientId: (newClientId) =>
    set((state) => ({
      ...state,
      clientId: newClientId,
    })),
  setUser: (newUser) => set((state) => ({ ...state, user: newUser })),
  setRoom: (newRoom) => set((state) => ({ ...state, room: newRoom })),
  setContextMenuShow: (newContextMenuShow) =>
    set((state) => ({
      ...state,
      contextMenu: { ...state.contextMenu, show: newContextMenuShow },
    })),
  setContextMenuPosition: (newContextMenuPosition) =>
    set((state) => ({
      ...state,
      contextMenu: { ...state.contextMenu, position: newContextMenuPosition },
    })),
  setContextMenuOptions: (newContextMenuOptions) =>
    set((state) => ({
      ...state,
      contextMenu: { ...state.contextMenu, options: newContextMenuOptions },
    })),
  setTransformingImage: (newTransformingImage, operation) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        transforming: newTransformingImage,
        transformingOperation:
          !newTransformingImage && operation ? undefined : operation,
      },
    })),
  setCroppingImage: (newCroppingImage) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        cropping: { ...state.images.cropping, enabled: newCroppingImage },
      },
    })),
  setCroppingNode: (newCroppingNode) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        cropping: { ...state.images.cropping, node: newCroppingNode },
      },
    })),
  setUploadingImage: (newUploadingImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, uploading: newUploadingImage },
    })),
  setShowSelectFileImage: (newShowSelectFileImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, showSelectFile: newShowSelectFileImage },
    })),
  setShowSelectFilesImages: (newShowSelectFilesImages) =>
    set((state) => ({
      ...state,
      images: { ...state.images, showSelectFiles: newShowSelectFilesImages },
    })),
  setLoadingImage: (newLoadingImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, loading: newLoadingImage },
    })),
  setFinishUploadCallbackImage: (newFinishUploadCallbackImage) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        finishUploadCallback: newFinishUploadCallbackImage,
      },
    })),
  setUploadingVideo: (newUploadingVideo) =>
    set((state) => ({
      ...state,
      videos: { ...state.videos, uploading: newUploadingVideo },
    })),
  setShowSelectFileVideo: (newShowSelectFileVideo) =>
    set((state) => ({
      ...state,
      videos: { ...state.videos, showSelectFile: newShowSelectFileVideo },
    })),
  setNodePropertiesAction: (newNodePropertiesAction) =>
    set((state) => ({
      ...state,
      nodeProperties: {
        ...state.nodeProperties,
        action: newNodePropertiesAction,
      },
    })),
  setNodePropertiesCreateProps: (newNodePropertiesCreateProps) =>
    set((state) => ({
      ...state,
      nodeProperties: {
        ...state.nodeProperties,
        createProps: newNodePropertiesCreateProps,
      },
    })),
  setSidebarActive: (newSidebarActive) =>
    set((state) => ({
      ...state,
      sidebar: {
        previouslyActive: state.sidebar.active,
        active: newSidebarActive,
      },
    })),
  setShowDrawer: (drawerKey, newOpen) =>
    set((state) => ({
      ...state,
      drawer: {
        ...state.drawer,
        [drawerKey]: {
          ...state.drawer[drawerKey],
          visible: newOpen,
        },
      },
    })),
  setRemoveBackgroundPopupAction: (newAction) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        removeBackgroundPopup: {
          ...state.images.removeBackgroundPopup,
          action: newAction,
        },
      },
    })),
  setRemoveBackgroundPopupShow: (newShow) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        removeBackgroundPopup: {
          ...state.images.removeBackgroundPopup,
          show: newShow,
        },
      },
    })),
  setRemoveBackgroundPopupOriginNodeId: (newOriginNodeId) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        removeBackgroundPopup: {
          ...state.images.removeBackgroundPopup,
          originNodeId: newOriginNodeId,
        },
      },
    })),
  setRemoveBackgroundPopupImageId: (newImageId) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        removeBackgroundPopup: {
          ...state.images.removeBackgroundPopup,
          imageId: newImageId,
        },
      },
    })),
  setRemoveBackgroundPopupImageURL: (newImageURL) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        removeBackgroundPopup: {
          ...state.images.removeBackgroundPopup,
          imageURL: newImageURL,
        },
      },
    })),
  setRemoveBackgroundPopupOriginImage: (newOriginImage) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        removeBackgroundPopup: {
          ...state.images.removeBackgroundPopup,
          originImage: newOriginImage,
        },
      },
    })),
  setCommBusConnected: (newConnected) =>
    set((state) => ({
      ...state,
      commBus: { ...state.commBus, connected: newConnected },
    })),
  setImageExporting(newExportingImage) {
    set((state) => ({
      ...state,
      images: { ...state.images, exporting: newExportingImage },
    }));
  },
  setCommentsStatus: (newStatus: CommentsStatus) =>
    set((state) => ({
      ...state,
      comments: {
        ...state.comments,
        status: newStatus,
      },
    })),
  setExportNodes: (newNodes: string[]) =>
    set((state) => ({
      ...state,
      export: {
        ...state.export,
        nodes: newNodes,
      },
    })),
  setExportConfigVisible: (newVisible: boolean) =>
    set((state) => ({
      ...state,
      export: {
        ...state.export,
        config: {
          ...state.export.config,
          visible: newVisible,
        },
      },
    })),
  setFontsLoaded: (newLoaded) =>
    set((state) => ({
      ...state,
      fonts: { ...state.fonts, loaded: newLoaded },
    })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFontsValues: (newValues: { id: string; name: string }[]) =>
    set((state) => ({
      ...state,
      fonts: { ...state.fonts, values: newValues },
    })),
  setConnectionTestsShow: (newShow: boolean) =>
    set((state) => ({
      ...state,
      connection: {
        ...state.connection,
        tests: { ...state.connection.tests, show: newShow },
      },
    })),
  setBackgroundColor: (newBackgroundColor) =>
    set((state) => ({
      ...state,
      backgroundColor: newBackgroundColor,
    })),
  setLinkedNode: (newLinkedNode) =>
    set((state) => ({
      ...state,
      linkedNode: newLinkedNode,
    })),
}));
