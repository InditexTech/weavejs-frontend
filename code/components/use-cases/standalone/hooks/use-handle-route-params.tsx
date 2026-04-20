// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useParams, useSearch } from "@tanstack/react-router";
import React from "react";
import { useStandaloneUseCase } from "../store/store";
import { useCollaborationRoom } from "@/store/store";

function useHandleRouteParams() {
  const setRoom = useCollaborationRoom((state) => state.setRoom);
  const setInstanceId = useStandaloneUseCase((state) => state.setInstanceId);
  const params = useParams({ from: "/use-cases/standalone/$instanceId" });
  const searchParams = useSearch({ from: "/use-cases/standalone/$instanceId" });

  React.useEffect(() => {
    const instanceId = params.instanceId;
    if (instanceId) {
      setRoom(instanceId);
      setInstanceId(instanceId);
    }
  }, [params.instanceId, searchParams, setRoom, setInstanceId]);
}

export default useHandleRouteParams;
