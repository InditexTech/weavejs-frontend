// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { getEmmiter } from "./use-tasks-events";

type UseHandlePageThumbnailChangeProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getImageURL(page: any) {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;
  return `${apiEndpoint}/${hubName}/rooms/${page.roomId}/pages/${page.pageId}/thumbnail`;
}

export const useHandlePageThumbnailChange = ({
  page,
}: Readonly<UseHandlePageThumbnailChangeProps>) => {
  const [thumbnailURL, setThumbnailURL] = React.useState<string>(
    getImageURL(page) + `?t=${uuidv4()}`,
  );

  React.useEffect(() => {
    const handlePageThumbnailUpdate = async (payload: {
      roomId: string;
      pageId: string;
      dataURL: string;
    }) => {
      if (payload.pageId === page.pageId) {
        setThumbnailURL(getImageURL(page) + `?t=${uuidv4()}`);
      }
      if (payload.pageId === page.pageId && payload.dataURL) {
        setThumbnailURL(payload.dataURL);
      }
    };

    const emmiter = getEmmiter();

    emmiter.on("pageThumbnailUpdated", handlePageThumbnailUpdate);

    return () => {
      emmiter.off("pageThumbnailUpdated", handlePageThumbnailUpdate);
    };
  }, [page]);

  return thumbnailURL;
};
