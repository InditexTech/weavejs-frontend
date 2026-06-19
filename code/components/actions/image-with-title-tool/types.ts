import Konva from "konva";
import { IMAGE_WITH_TITLE_TOOL_STATE } from "./constants";
import type {
  WeaveImageFile,
  WeaveImageURL,
  WeaveImageToolActionUploadType,
  WeaveImageToolActionUploadFunction,
} from "@inditextech/weave-sdk";
import type {
  DeepPartial,
  WeaveElementAttributes,
} from "@inditextech/weave-types";

export type ImageWithTitleToolActionStateKeys =
  keyof typeof IMAGE_WITH_TITLE_TOOL_STATE;
export type ImageWithTitleToolActionState =
  (typeof IMAGE_WITH_TITLE_TOOL_STATE)[ImageWithTitleToolActionStateKeys];

export type ImageWithTitleToolActionConfig = {
  style: {
    cursor: {
      padding: number;
      imageThumbnail: {
        width: number;
        height: number;
        shadowColor: string;
        shadowBlur: number;
        shadowOffset: Konva.Vector2d;
        shadowOpacity: number;
      };
    };
  };
};

export type ImageWithTitleToolActionParams = {
  config: DeepPartial<ImageWithTitleToolActionConfig>;
};

export type ImageToolActionData = {
  props: WeaveElementAttributes;
  imageId: string | null;
  container: Konva.Layer | Konva.Node | undefined;
  imageFile: WeaveImageFile | null;
  imageURL: WeaveImageURL | null;
  imageFallbackURL: string | null;
  forceMainContainer: boolean;
  clickPoint: Konva.Vector2d | null;
  uploadType: WeaveImageToolActionUploadType | null;
  uploadImageFunction: WeaveImageToolActionUploadFunction | null;
};
