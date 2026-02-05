// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { useTemplatesUseCase } from "../store/store";

function useHandleRouteParams() {
  const setInstanceId = useTemplatesUseCase((state) => state.setInstanceId);
  const params = useParams<{ instanceId: string }>();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const instanceId = params.instanceId;
    if (instanceId) {
      setInstanceId(instanceId);
    }
  }, [params.instanceId, searchParams, setInstanceId]);
}

export default useHandleRouteParams;
