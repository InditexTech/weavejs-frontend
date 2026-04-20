// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { RoomShadowDom } from "@/components/room/room-shadow-dom";
import { mountToShadowDom } from "../utils/mount-to-shadow-dom";
import useHandleRouteParams from "../room-components/hooks/use-handle-route-params";

export function RoomShadowDomHost() {
  const navigate = useNavigate();

  const { loadedParams } = useHandleRouteParams();

  React.useEffect(() => {
    mountToShadowDom(RoomShadowDom, "shadow-host");
  }, []);

  React.useEffect(() => {
    const handleRoute = function () {
      console.log("handling route");
    };

    window.addEventListener("nextRouter", handleRoute);
    return () => {
      window.removeEventListener("nextRouter", handleRoute);
    };
  }, [navigate, loadedParams]);

  return <div id="shadow-host" className="w-full h-full" />;
}
