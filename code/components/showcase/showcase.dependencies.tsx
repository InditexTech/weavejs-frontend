// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Button } from "../ui/button";
import { Info, X } from "lucide-react";
import weavePackage from "../../node_modules/@inditextech/weave-sdk/package.json";
import weaveReactHelperPackage from "../../node_modules/@inditextech/weave-react/package.json";
import weaveStoreStandalonePackage from "../../node_modules/@inditextech/weave-store-standalone/package.json";
import weaveStorePackage from "../../node_modules/@inditextech/weave-store-azure-web-pubsub/package.json";
import { useCollaborationRoom } from "@/store/store";

export const ShowcaseDependencies = () => {
  const dependenciesVisible = useCollaborationRoom(
    (state) => state.dependencies.visible,
  );
  const setDependenciesVisible = useCollaborationRoom(
    (state) => state.setDependenciesVisible,
  );

  if (!dependenciesVisible) {
    return null;
  }

  return (
    <div className="w-[calc(100dvw-24px)] lg:w-auto absolute bottom-3 right-3 lg:bottom-8 lg:right-8 flex flex-col items-start justify-center bg-background p-5 pt-3 border border-[#c9c9c9]">
      <div className="w-full flex gap-2 justify-between items-center mb-5 uppercase">
        <div className="flex gap-2 justify-start items-center font-inter font-light text-sm">
          <Info strokeWidth={1} size={16} />
          Dependencies Used
        </div>
        <Button
          variant="link"
          onClick={() => {
            setDependenciesVisible(false);
          }}
          className="cursor-pointer font-inter font-light !px-0"
        >
          <X strokeWidth={1} />
        </Button>
      </div>
      <div className="w-full grid grid-cols-[1fr_auto] gap-x-5 gap-y-1 justify-center-items-center font-light text-[12px]">
        <div className="flex gap-1 justify-start items-center">
          <code>@inditextech/weave-sdk</code>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <code className="bg-[#e9e9e9] px-2 py-1">
            v{weavePackage.version}
          </code>
        </div>
        <div className="flex gap-1 justify-start items-center">
          <code>@inditextech/weave-react</code>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <code className="bg-[#e9e9e9] px-2 py-1">
            v{weaveReactHelperPackage.version}
          </code>
        </div>
        <div className="flex gap-1 justify-start items-center">
          <code>@inditextech/weave-store-standalone</code>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <code className="bg-[#e9e9e9] px-2 py-1">
            v{weaveStoreStandalonePackage.version}
          </code>
        </div>
        <div className="flex gap-1 justify-start items-center">
          <code>@inditextech/weave-store-azure-web-pubsub</code>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <code className="bg-[#e9e9e9] px-2 py-1">
            v{weaveStorePackage.version}
          </code>
        </div>
      </div>
    </div>
  );
};
