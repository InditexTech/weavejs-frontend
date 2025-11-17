import { IMAGE_TEMPLATE_FIT } from "./constants";

export type ImageTemplateFitKeys = keyof typeof IMAGE_TEMPLATE_FIT;
export type ImageTemplateFit =
  (typeof IMAGE_TEMPLATE_FIT)[ImageTemplateFitKeys];
