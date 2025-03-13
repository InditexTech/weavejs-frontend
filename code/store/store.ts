import { Vector2d } from "konva/lib/types";
import { create } from "zustand";
import { ContextMenuOption } from "@/components/room-components/context-menu";
import { WeaveElementAttributes } from "@inditextech/weavejs-sdk";

type ShowcaseUser = {
  name: string;
  email: string;
};

type NodePropertiesAction = "create" | "update" | undefined;

interface CollaborationRoomState {
  fetchConnectionUrl: {
    loading: boolean;
    error: Error | null;
  };
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
    visible: boolean;
  };
  images: {
    uploading: boolean;
    loading: boolean;
    library: {
      visible: boolean;
    };
  };
  frames: {
    library: {
      visible: boolean;
    };
  };
  pantones: {
    library: {
      visible: boolean;
    };
  };
  setFetchConnectionUrlLoading: (newLoading: boolean) => void;
  setFetchConnectionUrlError: (
    newFetchConnectionUrlError: Error | null
  ) => void;
  setUser: (newUser: ShowcaseUser | undefined) => void;
  setRoom: (newRoom: string | undefined) => void;
  setContextMenuShow: (newContextMenuShow: boolean) => void;
  setContextMenuPosition: (newContextMenuPosition: Vector2d) => void;
  setContextMenuOptions: (newContextMenuOptions: ContextMenuOption[]) => void;
  setUploadingImage: (newUploadingImage: boolean) => void;
  setLoadingImage: (newLoadingImage: boolean) => void;
  setNodePropertiesAction: (
    newNodePropertiesAction: NodePropertiesAction
  ) => void;
  setNodePropertiesCreateProps: (
    newNodePropertiesCreateProps: WeaveElementAttributes | undefined
  ) => void;
  setNodePropertiesVisible: (newNodePropertiesVisible: boolean) => void;
  setImagesLibraryVisible: (newImagesLibraryVisible: boolean) => void;
  setFramesLibraryVisible: (newFramesLibraryVisible: boolean) => void;
  setPantonesLibraryVisible: (newPantonesLibraryVisible: boolean) => void;
}

export const useCollaborationRoom = create<CollaborationRoomState>()((set) => ({
  fetchConnectionUrl: {
    loading: false,
    error: null,
  },
  user: undefined,
  room: undefined,
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
  images: {
    uploading: false,
    loading: false,
    library: {
      visible: false,
    },
  },
  frames: {
    library: {
      visible: false,
    },
  },
  pantones: {
    library: {
      visible: false,
    },
  },
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
  setUploadingImage: (newUploadingImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, uploading: newUploadingImage },
    })),
  setLoadingImage: (newLoadingImage) =>
    set((state) => ({
      ...state,
      images: { ...state.images, loading: newLoadingImage },
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
  setNodePropertiesVisible: (newNodePropertiesVisible) =>
    set((state) => ({
      ...state,
      nodeProperties: {
        ...state.nodeProperties,
        visible: newNodePropertiesVisible,
      },
    })),
  setImagesLibraryVisible: (newImagesLibraryVisible) =>
    set((state) => ({
      ...state,
      images: {
        ...state.images,
        library: { ...state.images.library, visible: newImagesLibraryVisible },
      },
    })),
  setFramesLibraryVisible: (newFramesLibraryVisible) =>
    set((state) => ({
      ...state,
      frames: {
        ...state.frames,
        library: {
          ...state.frames.library,
          visible: newFramesLibraryVisible,
        },
      },
    })),
  setPantonesLibraryVisible: (newPantonesLibraryVisible) =>
    set((state) => ({
      ...state,
      pantones: {
        ...state.pantones,
        library: {
          ...state.pantones.library,
          visible: newPantonesLibraryVisible,
        },
      },
    })),
}));
