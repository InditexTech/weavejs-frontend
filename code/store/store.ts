// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { create } from "zustand";
import { ContextMenuOption } from "@/components/room-components/context-menu";
import { WeaveElementAttributes, WeaveFont } from "@inditextech/weave-types";
import {
  WEAVE_GRID_TYPES,
  WeaveStageGridType,
  WEAVE_GRID_DOT_TYPES,
  WeaveStageGridDotType,
} from "@inditextech/weave-sdk";
import { DRAWER_ELEMENTS, SIDEBAR_ELEMENTS } from "@/lib/constants";
import merge from "lodash/merge";

type PresentationModeState = "idle" | "loading" | "loaded" | "error";

type NodePropertiesAction = "create" | "update" | undefined;

type CommentsStatus = "pending" | "resolved" | "all";

type RoomDataStatus = "idle" | "loading" | "loaded" | "error";

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

export type ViewType = "fixed" | "floating";

type DrawerKeyKeys = keyof typeof DRAWER_ELEMENTS;
export type DrawerKey = (typeof DRAWER_ELEMENTS)[DrawerKeyKeys];

type SidebarActiveKeys = keyof typeof SIDEBAR_ELEMENTS;
export type SidebarActive = (typeof SIDEBAR_ELEMENTS)[SidebarActiveKeys] | null;

interface CollaborationRoomState {
  signingIn: boolean;
  viewType: ViewType;
  showLeftSidebarFloating: boolean;
  showRightSidebarFloating: boolean;
  grid: {
    enabled: boolean;
    type: WeaveStageGridType;
    dots: {
      kind: WeaveStageGridDotType;
    };
  };
  backgroundColor: BackgroundColor;
  dependencies: {
    visible: boolean;
  };
  configuration: {
    open: boolean;
    upscale: {
      enabled: boolean;
      baseWidth: number;
      baseHeight: number;
      multiplier: number;
    };
  };
  referenceArea: {
    size: string;
  };
  measurement: {
    units: string;
    referenceMeasureUnits: number;
    referenceMeasurePixels: number | null;
  };
  features: {
    workloads: boolean;
    threads: boolean;
  };
  fetchConnectionUrl: {
    loading: boolean;
    error: Error | null;
  };
  pages: {
    listVisible: boolean;
    gridVisible: boolean;
    amount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actualPages: any[];
    actualPage: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actualPageElement: any;
    actualPageId: string | null;
  };
  linkedNode: Konva.Node | null;
  fonts: {
    loaded: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: WeaveFont[];
  };
  ui: {
    usersPointers: {
      visible: boolean;
    };
    comments: {
      visible: boolean;
    };
    referenceArea: {
      visible: boolean;
    };
    minimap: boolean;
  };
  presentation: {
    instanceId: string | null;
    visible: boolean;
    loadedPages: number;
    status: PresentationModeState;
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
  leaderId: string | null;
  room: string | undefined;
  roomInfo: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any | undefined;
    error: Error | undefined;
    loading: boolean;
    loaded: boolean;
  };
  status: RoomDataStatus;
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
  rooms: {
    filters: {
      searchText: string;
      status: "all" | "active" | "archived";
    };
    roomId: string | undefined;
    pageId: string | undefined;
    access: {
      visible: boolean;
    };
    join: {
      visible: boolean;
    };
    create: {
      visible: boolean;
    };
    edit: {
      visible: boolean;
    };
    delete: {
      visible: boolean;
    };
    editPage: {
      visible: boolean;
    };
    deletePage: {
      visible: boolean;
    };
  };
  export: {
    nodes: string[]; // node ids
    page: {
      image: {
        visible: boolean;
      };
    };
    room: {
      pdf: {
        visible: boolean;
      };
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
    adding: boolean;
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
  frames: {
    export: {
      exporting: boolean;
      visible: boolean;
    };
    images: Record<string, HTMLImageElement>;
    pages: { title: string; nodes: string[] }[];
  };
  setSigningIn: (newSigningIn: boolean) => void;
  setShowMinimap: (newShowMinimap: boolean) => void;
  setFetchConnectionUrlLoading: (newLoading: boolean) => void;
  setFetchConnectionUrlError: (
    newFetchConnectionUrlError: Error | null,
  ) => void;
  setClientId: (newClientId: string | undefined) => void;
  setRoom: (newRoom: string | undefined) => void;
  setRoomStatus: (newStatus: RoomDataStatus) => void;
  setContextMenuShow: (newContextMenuShow: boolean) => void;
  setContextMenuPosition: (newContextMenuPosition: Vector2d) => void;
  setContextMenuOptions: (newContextMenuOptions: ContextMenuOption[]) => void;
  setTransformingImage: (
    newTransformingImage: boolean,
    operation?: TransformingOperation,
  ) => void;
  setCroppingImage: (newCroppingImage: boolean) => void;
  setCroppingNode: (newCroppingNode: Konva.Node | undefined) => void;
  setUploadingVideo: (newUploadingVideo: boolean) => void;
  setShowSelectFileVideo: (newShowSelectFileVideo: boolean) => void;
  setAddingImages: (newAddingImages: boolean) => void;
  setUploadingImage: (newUploadingImage: boolean) => void;
  setShowSelectFilesImages: (newShowSelectFilesImages: boolean) => void;
  setShowSelectFileImage: (newShowSelectFileImage: boolean) => void;
  setLoadingImage: (newLoadingImage: boolean) => void;
  setFinishUploadCallbackImage: (
    newFinishUploadCallbackImage: FinishUploadCallback | null,
  ) => void;
  setNodePropertiesAction: (
    newNodePropertiesAction: NodePropertiesAction,
  ) => void;
  setNodePropertiesCreateProps: (
    newNodePropertiesCreateProps: WeaveElementAttributes | undefined,
  ) => void;
  setSidebarActive: (newSidebarActive: SidebarActive) => void;
  setShowDrawer: (drawerKey: DrawerKey, newOpen: boolean) => void;
  setRemoveBackgroundPopupAction: (
    newAction: "replace" | "new" | undefined,
  ) => void;
  setRemoveBackgroundPopupShow: (newShow: boolean) => void;
  setRemoveBackgroundPopupOriginImage: (
    newOriginImage: string | undefined,
  ) => void;
  setRemoveBackgroundPopupOriginNodeId: (
    newOriginNodeId: string | undefined,
  ) => void;
  setRemoveBackgroundPopupImageId: (newImageId: string | undefined) => void;
  setRemoveBackgroundPopupImageURL: (newImageURL: string | undefined) => void;
  setCommBusConnected: (newConnected: boolean) => void;
  setImageExporting: (newExportingImage: boolean) => void;
  setCommentsStatus: (newStatus: CommentsStatus) => void;
  setExportNodes: (newNodes: string[]) => void;
  setExportPageToImageConfigVisible: (newVisible: boolean) => void;
  setExportRoomToPdfConfigVisible: (newVisible: boolean) => void;
  setFontsLoaded: (newLoaded: boolean) => void;
  setFontsValues: (newValues: { id: string; name: string }[]) => void;
  setConnectionTestsShow: (newShow: boolean) => void;
  setBackgroundColor: (newBackgroundColor: BackgroundColor) => void;
  setLinkedNode: (newLinkedNode: Konva.Node | null) => void;
  setConfigurationOpen: (newOpen: boolean) => void;
  setConfiguration: (
    upscale: boolean,
    baseWidth: number,
    baseHeight: number,
    multiplier: number,
  ) => void;
  setMeasurement: (units: string, referenceMeasureUnits: number) => void;
  setReferenceMeasurePixels: (referenceMeasurePixels: number | null) => void;
  setFramesExportVisible: (newVisible: boolean) => void;
  setFramesExporting: (newExporting: boolean) => void;
  setFramesPages: (newPages: { title: string; nodes: string[] }[]) => void;
  setViewType: (newView: ViewType) => void;
  setShowLeftSidebarFloating: (newShowLeftSidebarFloating: boolean) => void;
  setShowRightSidebarFloating: (newShowRightSidebarFloating: boolean) => void;
  setReferenceAreaSize: (newSize: string) => void;
  setPagesListVisible: (newVisible: boolean) => void;
  setPagesGridVisible: (newVisible: boolean) => void;
  setPagesAmount: (newAmount: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPagesActualPages: (newActualPages: any[]) => void;
  setPagesActualPage: (newActualPage: number) => void;
  setPagesActualPageId: (newActualPageId: string | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPagesActualPageElement: (newActualPageElement: any) => void;
  setRoomsCreateVisible: (newRoom: boolean) => void;
  setRoomsJoinVisible: (newRoom: boolean) => void;
  setRoomsRoomId: (newRoomId: string | undefined) => void;
  setRoomsPageId: (newPageId: string | undefined) => void;
  setRoomsEditVisible: (newRoom: boolean) => void;
  setRoomsDeleteVisible: (newRoom: boolean) => void;
  setRoomsAccessVisible: (newRoom: boolean) => void;
  setDependenciesVisible: (newVisible: boolean) => void;
  setRoomsPageEditVisible: (newPageEdit: boolean) => void;
  setRoomsPageDeleteVisible: (newPageDelete: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setRoomInfoData: (newRoomInfo: any | undefined) => void;
  setRoomInfoLoading: (newLoading: boolean) => void;
  setRoomInfoLoaded: (newLoaded: boolean) => void;
  setRoomInfoError: (newError: Error | undefined) => void;
  setRoomsSearchTextFilter: (newSearchText: string) => void;
  setRoomsStatusFilter: (
    newStatusFilter: "all" | "active" | "archived",
  ) => void;
  setLeaderId: (newLeaderId: string | null) => void;
  setFramesImages: (newImages: Record<string, HTMLImageElement>) => void;
  setPresentationVisible: (newVisible: boolean) => void;
  setPresentationStatus: (newStatus: PresentationModeState) => void;
  setPresentationInstanceId: (newInstanceId: string | null) => void;
  setPresentationPagesStatus: (loadedPages: number) => void;
  setGridEnabled: (newEnabled: boolean) => void;
  setGridType: (newType: WeaveStageGridType) => void;
  setGridDotsKind: (newDotsKind: WeaveStageGridDotType) => void;
  setUIUsersPointersVisible: (newVisible: boolean) => void;
  setUICommentsVisible: (newVisible: boolean) => void;
  setUIReferenceAreaVisible: (newVisible: boolean) => void;
}

export const useCollaborationRoom = create<CollaborationRoomState>()((set) => {
  const defaultConfiguration = {
    open: false,
    upscale: {
      enabled: false,
      baseWidth: 1920,
      baseHeight: 1080,
      multiplier: 1,
    },
  };

  let configurationFromStorage = {};
  if (typeof sessionStorage !== "undefined") {
    configurationFromStorage = JSON.parse(
      sessionStorage.getItem("weave_ai_configuration") || "{}",
    );
  }

  const finalConfiguration = merge(
    defaultConfiguration,
    configurationFromStorage,
  );

  return {
    signingIn: false,
    viewType: "floating",
    showLeftSidebarFloating: false,
    showRightSidebarFloating: false,
    grid: {
      enabled: false,
      type: WEAVE_GRID_TYPES.DOTS,
      dots: {
        kind: WEAVE_GRID_DOT_TYPES.CIRCLE,
      },
    },
    backgroundColor: BACKGROUND_COLOR.GRAY,
    dependencies: {
      visible: false,
    },
    measurement: {
      units: "cms",
      referenceMeasureUnits: 10,
      referenceMeasurePixels: null,
    },
    referenceArea: {
      size: "4K",
    },
    configuration: finalConfiguration,
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
      usersPointers: {
        visible: true,
      },
      comments: {
        visible: true,
      },
      referenceArea: {
        visible: true,
      },
      minimap: false,
    },
    fetchConnectionUrl: {
      loading: false,
      error: null,
    },
    clientId: undefined,
    leaderId: null,
    room: undefined,
    roomInfo: {
      data: undefined,
      loading: false,
      loaded: false,
      error: undefined,
    },
    status: "idle",
    sidebar: {
      previouslyActive: null,
      active: SIDEBAR_ELEMENTS.nodeProperties,
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
    pages: {
      listVisible: false,
      gridVisible: false,
      amount: 0,
      actualPages: [],
      actualPage: 1,
      actualPageElement: null,
      actualPageId: null,
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
    rooms: {
      filters: {
        searchText: "",
        status: "active",
      },
      roomId: undefined,
      pageId: undefined,
      access: {
        visible: false,
      },
      create: {
        visible: false,
      },
      join: {
        visible: false,
      },
      edit: {
        visible: false,
      },
      delete: {
        visible: false,
      },
      editPage: {
        visible: false,
      },
      deletePage: {
        visible: false,
      },
    },
    export: {
      nodes: [],
      page: {
        image: {
          visible: false,
        },
      },
      room: {
        pdf: {
          visible: false,
        },
      },
    },
    videos: {
      showSelectFile: false,
      uploading: false,
    },
    images: {
      adding: false,
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
      export: {
        exporting: false,
        visible: false,
      },
      images: {},
      pages: [],
    },
    presentation: {
      visible: false,
      instanceId: null,
      loadedPages: 0,
      status: "idle",
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
    setSigningIn: (newSigningIn) =>
      set((state) => ({
        ...state,
        signingIn: newSigningIn,
      })),
    setShowMinimap: (newShowMinimap) =>
      set((state) => ({
        ...state,
        ui: { ...state.ui, minimap: newShowMinimap },
      })),
    setFetchConnectionUrlLoading: (newLoading) =>
      set((state) => ({
        ...state,
        fetchConnectionUrl: {
          ...state.fetchConnectionUrl,
          loading: newLoading,
        },
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
    setRoom: (newRoom) => set((state) => ({ ...state, room: newRoom })),
    setRoomStatus: (newStatus) =>
      set((state) => ({
        ...state,
        status: newStatus,
      })),
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
    setAddingImages: (newAddingImages) =>
      set((state) => ({
        ...state,
        images: { ...state.images, adding: newAddingImages },
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
    setExportPageToImageConfigVisible: (newVisible: boolean) =>
      set((state) => ({
        ...state,
        export: {
          ...state.export,
          page: {
            ...state.export.page,
            image: {
              ...state.export.page.image,
              visible: newVisible,
            },
          },
        },
      })),
    setExportRoomToPdfConfigVisible: (newVisible: boolean) =>
      set((state) => ({
        ...state,
        export: {
          ...state.export,
          room: {
            ...state.export.room,
            pdf: {
              ...state.export.room.pdf,
              visible: newVisible,
            },
          },
        },
      })),
    setFontsLoaded: (newLoaded) =>
      set((state) => ({
        ...state,
        fonts: { ...state.fonts, loaded: newLoaded },
      })),
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
    setConfigurationOpen: (newOpen: boolean) =>
      set((state) => ({
        ...state,
        configuration: {
          ...state.configuration,
          open: newOpen,
        },
      })),
    setConfiguration: (
      upscale: boolean,
      baseWidth: number,
      baseHeight: number,
      multiplier: number,
    ) =>
      set((state) => ({
        ...state,
        configuration: {
          ...state.configuration,
          upscale: {
            enabled: upscale,
            baseWidth,
            baseHeight,
            multiplier,
          },
        },
      })),
    setMeasurement: (units: string, referenceMeasureUnits: number) =>
      set((state) => ({
        ...state,
        measurement: {
          ...state.measurement,
          units,
          referenceMeasureUnits,
        },
      })),
    setReferenceMeasurePixels: (referenceMeasurePixels: number | null) =>
      set((state) => ({
        ...state,
        measurement: {
          ...state.measurement,
          referenceMeasurePixels,
        },
      })),
    setFramesExportVisible: (newVisible: boolean) =>
      set((state) => ({
        ...state,
        frames: {
          ...state.frames,
          export: {
            ...state.frames.export,
            visible: newVisible,
          },
        },
      })),
    setFramesExporting: (newExporting: boolean) =>
      set((state) => ({
        ...state,
        frames: {
          ...state.frames,
          export: {
            ...state.frames.export,
            exporting: newExporting,
          },
        },
      })),
    setFramesPages: (newPages: { title: string; nodes: string[] }[]) =>
      set((state) => ({
        ...state,
        frames: {
          ...state.frames,
          pages: newPages,
        },
      })),
    setViewType: (newView) =>
      set((state) => ({
        ...state,
        viewType: newView,
      })),
    setShowLeftSidebarFloating: (newShowSidebarFloating) =>
      set((state) => ({
        ...state,
        showLeftSidebarFloating: newShowSidebarFloating,
      })),
    setShowRightSidebarFloating: (newShowSidebarFloating) =>
      set((state) => ({
        ...state,
        showRightSidebarFloating: newShowSidebarFloating,
      })),
    setReferenceAreaSize: (newSize) =>
      set((state) => ({
        ...state,
        referenceArea: {
          ...state.referenceArea,
          size: newSize,
        },
      })),
    setPagesListVisible: (newVisible) =>
      set((state) => ({
        ...state,
        pages: {
          ...state.pages,
          listVisible: newVisible,
        },
      })),
    setPagesGridVisible: (newVisible) =>
      set((state) => ({
        ...state,
        pages: {
          ...state.pages,
          gridVisible: newVisible,
        },
      })),
    setPagesAmount: (newAmount) =>
      set((state) => ({
        ...state,
        pages: {
          ...state.pages,
          amount: newAmount,
        },
      })),
    setPagesActualPages: (newActualPages) =>
      set((state) => ({
        ...state,
        pages: {
          ...state.pages,
          actualPages: newActualPages,
        },
      })),
    setPagesActualPage: (newActualPage) =>
      set((state) => ({
        ...state,
        pages: {
          ...state.pages,
          actualPage: newActualPage,
        },
      })),
    setPagesActualPageId: (newActualPageId) =>
      set((state) => ({
        ...state,
        pages: {
          ...state.pages,
          actualPageId: newActualPageId,
        },
      })),
    setPagesActualPageElement: (newActualPageElement) =>
      set((state) => ({
        ...state,
        pages: {
          ...state.pages,
          actualPageElement: newActualPageElement,
        },
      })),
    setRoomsCreateVisible: (newRoom) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          create: {
            visible: newRoom,
          },
        },
      })),
    setRoomsJoinVisible: (newRoom) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          join: {
            visible: newRoom,
          },
        },
      })),
    setRoomsAccessVisible: (newRoom) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          access: {
            visible: newRoom,
          },
        },
      })),
    setRoomsEditVisible: (newRoom) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          edit: {
            ...state.rooms.edit,
            visible: newRoom,
          },
        },
      })),
    setRoomsDeleteVisible: (newRoom) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          delete: {
            ...state.rooms.delete,
            visible: newRoom,
          },
        },
      })),
    setRoomsPageEditVisible: (newPageEdit) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          editPage: {
            ...state.rooms.editPage,
            visible: newPageEdit,
          },
        },
      })),
    setRoomsPageDeleteVisible: (newPageDelete) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          deletePage: {
            ...state.rooms.deletePage,
            visible: newPageDelete,
          },
        },
      })),
    setRoomsRoomId: (newRoomId) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          roomId: newRoomId,
        },
      })),
    setRoomsPageId: (newPageId) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          pageId: newPageId,
        },
      })),
    setDependenciesVisible: (newVisible) =>
      set((state) => ({
        ...state,
        dependencies: {
          visible: newVisible,
        },
      })),
    setRoomInfoData: (newRoomInfo) =>
      set((state) => ({
        ...state,
        roomInfo: {
          ...state.roomInfo,
          data: newRoomInfo,
        },
      })),
    setRoomInfoLoading: (newLoading) =>
      set((state) => ({
        ...state,
        roomInfo: {
          ...state.roomInfo,
          loading: newLoading,
        },
      })),
    setRoomInfoLoaded: (newLoaded) =>
      set((state) => ({
        ...state,
        roomInfo: {
          ...state.roomInfo,
          loaded: newLoaded,
        },
      })),
    setRoomInfoError: (newError) =>
      set((state) => ({
        ...state,
        roomInfo: {
          ...state.roomInfo,
          error: newError,
        },
      })),
    setRoomsSearchTextFilter: (newSearchText) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          filters: {
            ...state.rooms.filters,
            searchText: newSearchText,
          },
        },
      })),
    setRoomsStatusFilter: (newStatusFilter) =>
      set((state) => ({
        ...state,
        rooms: {
          ...state.rooms,
          filters: {
            ...state.rooms.filters,
            status: newStatusFilter,
          },
        },
      })),
    setLeaderId: (newLeaderId) =>
      set((state) => ({
        ...state,
        leaderId: newLeaderId,
      })),
    setFramesImages: (newImages) =>
      set((state) => ({
        ...state,
        frames: {
          ...state.frames,
          images: newImages,
        },
      })),
    setPresentationVisible: (newVisible) =>
      set((state) => ({
        ...state,
        presentation: {
          ...state.presentation,
          visible: newVisible,
        },
      })),
    setPresentationStatus: (newStatus) =>
      set((state) => ({
        ...state,
        presentation: {
          ...state.presentation,
          status: newStatus,
        },
      })),
    setPresentationInstanceId: (newInstanceId) =>
      set((state) => ({
        ...state,
        presentation: {
          ...state.presentation,
          instanceId: newInstanceId,
        },
      })),
    setPresentationPagesStatus: (loadedPages) =>
      set((state) => ({
        ...state,
        presentation: {
          ...state.presentation,
          loadedPages,
        },
      })),
    setGridEnabled: (newEnabled) =>
      set((state) => ({
        ...state,
        grid: {
          ...state.grid,
          enabled: newEnabled,
        },
      })),
    setGridType: (newType) =>
      set((state) => ({
        ...state,
        grid: {
          ...state.grid,
          type: newType,
        },
      })),
    setGridDotsKind(newDotsKind) {
      set((state) => ({
        ...state,
        grid: {
          ...state.grid,
          dots: {
            ...state.grid.dots,
            kind: newDotsKind,
          },
        },
      }));
    },
    setUIUsersPointersVisible: (newVisible) =>
      set((state) => ({
        ...state,
        ui: {
          ...state.ui,
          usersPointers: {
            visible: newVisible,
          },
        },
      })),
    setUICommentsVisible: (newVisible) =>
      set((state) => ({
        ...state,
        ui: {
          ...state.ui,
          comments: {
            visible: newVisible,
          },
        },
      })),
    setUIReferenceAreaVisible: (newVisible) =>
      set((state) => ({
        ...state,
        ui: {
          ...state.ui,
          referenceArea: {
            visible: newVisible,
          },
        },
      })),
  };
});
