import { WeaveStateElement } from "@inditextech/weave-types";
import { ImageTemplateMetadata } from "../components/templates/types";

export const extractImagesTemplatesMetadata = (
  template: WeaveStateElement,
  metadata: Record<string, ImageTemplateMetadata>,
) => {
  if (template.type === "image-template") {
    metadata[template.key] = {
      key: template.key,
      width: template.props.width,
      height: template.props.height,
    };
  } else {
    const children: WeaveStateElement[] = template.props?.children ?? [];
    if (children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        const childTemplate = children[i];
        extractImagesTemplatesMetadata(childTemplate, metadata);
      }
    }
  }
};
