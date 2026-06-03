// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useAddTemplateToRoom } from "@/store/add-template-to-room";
import { useJsonTemplate } from "../hooks/use-json-template";

type AddToRoomRenderTemplateProps = {
  width: number;
  height: number;
  readOnly: boolean;
};

export function AddToRoomRenderTemplate(
  params: Readonly<AddToRoomRenderTemplateProps>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [templateData, setTemplateData] = React.useState<any>(null);

  const room = useAddTemplateToRoom((state) => state.room);
  const template = useAddTemplateToRoom((state) => state.template);
  const templateParameters = useAddTemplateToRoom((state) => state.parameters);
  const selectedNode = useAddTemplateToRoom((state) => state.selectedNode);
  const renderSize = useAddTemplateToRoom((state) => state.render.size);
  const renderScale = useAddTemplateToRoom((state) => state.render.scale);
  const setSelectedNode = useAddTemplateToRoom(
    (state) => state.setSelectedNode,
  );
  const setTemplateRender = useAddTemplateToRoom(
    (state) => state.setTemplateRender,
  );

  const { getTemplateToHTML } = useJsonTemplate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nodesHTML, setNodesHTML] = React.useState<any>(null);

  React.useEffect(() => {
    if (!template) return;

    try {
      const templateData = JSON.parse(template.templateData);
      setTemplateData(templateData);
    } catch {
      setTemplateData(null);
    }
  }, [template]);

  React.useEffect(() => {
    if (!templateData) return;

    try {
      const {
        structure: model,
        scale,
        size,
      } = getTemplateToHTML(
        templateData,
        {
          width: params.width,
          height: params.height,
        },
        templateParameters,
        selectedNode,
        setSelectedNode,
        {
          readOnly: params.readOnly,
        },
      );

      setTemplateRender(size, scale);
      setNodesHTML(model);
    } catch (ex) {
      console.error(ex);
      setNodesHTML(null);
    }
  }, [templateData, templateParameters, selectedNode, setSelectedNode]);

  const diffX = React.useMemo(
    () => params.width - renderSize.width * renderScale,
    [renderScale, renderSize],
  );
  const diffY = React.useMemo(
    () => params.height - renderSize.height * renderScale,
    [renderScale, renderSize],
  );

  if (!template || !room) {
    return null;
  }

  return (
    <div
      className={`relative`}
      style={{
        width: `${params.width}px`,
        height: `${params.height}px`,
      }}
    >
      <div
        className="absolute"
        style={{
          top: `${diffY / 2}px`,
          left: `${diffX / 2}px`,
          width: `${renderSize.width}px`,
          height: `${renderSize.height}px`,
          transformOrigin: "top left",
          transform: `translate(0px, 0px) scale(${renderScale})`,
        }}
      >
        {nodesHTML}
      </div>
    </div>
  );
}
