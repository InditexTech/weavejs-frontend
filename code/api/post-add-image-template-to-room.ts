// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ZodError } from "zod";
import {
  templateParametersSchema,
  type TemplateParameters,
} from "@/components/room-components/hooks/template-parameters.schema";

export type PostAddImageTemplateToRoomPayload = {
  roomId: string;
  pageId: string;
  templateId: string;
  target: {
    id: string;
    position: {
      x: number;
      y: number;
    };
  };
  parameters: TemplateParameters;
};

export const postAddImageTemplateToRoom = async (
  payload: PostAddImageTemplateToRoomPayload,
) => {
  try {
    templateParametersSchema.parse(payload.parameters);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(
        `Invalid template parameters before sending request: ${error.message}`,
        { cause: "InvalidTemplateParameters" },
      );
    }
    throw error;
  }

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

  const endpoint = `${apiEndpoint}/${hubName}/templates/add-image-template-to-room`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error("Failed to add image template to room: " + errorData.error);
  }

  const data = await response.json();

  return data;
};
