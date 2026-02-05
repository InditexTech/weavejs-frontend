// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ImageTemplateMetadata } from "../components/templates/types";
import { extractImagesTemplatesMetadata } from "../utils/utils";

type UseAmountSlotsTemplateProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: any;
};

export const useAmountSlotsTemplate = ({
  template,
}: UseAmountSlotsTemplateProps) => {
  const [amountOfImageTemplates, setAmountOfImageTemplates] = React.useState(0);

  React.useEffect(() => {
    const metadata: Record<string, ImageTemplateMetadata> = {};
    let templateData;
    try {
      templateData = JSON.parse(template.templateData);
      const templateElements = Object.keys(templateData.weave);
      const templateElement = templateData.weave[templateElements[0]];
      extractImagesTemplatesMetadata(templateElement.element, metadata);
      setAmountOfImageTemplates(Object.keys(metadata).length);
    } catch {
      setAmountOfImageTemplates(0);
    }
  }, [template]);

  return amountOfImageTemplates;
};
