// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import useHandleRouteParams from "../../hooks/use-handle-route-params";
import { useTemplatesUseCase } from "../../store/store";
import { PageLoader } from "./page-loader";
import UserForm from "./user-form";
import { ScaleLoader } from "react-spinners";
import { Templates } from "../templates/templates";
import { Resources } from "../resources/resources";
import {
  CloudUpload,
  //LayoutPanelTop,
  X,
} from "lucide-react";
import { Menu } from "./menu";

export const TemplatesPage = () => {
  useHandleRouteParams();

  const user = useTemplatesUseCase((state) => state.user);
  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const templatesManage = useTemplatesUseCase(
    (state) => state.templates.manage,
  );
  const setUser = useTemplatesUseCase((state) => state.setUser);
  const setTemplatesManage = useTemplatesUseCase(
    (state) => state.setTemplatesManage,
  );

  React.useEffect(() => {
    console.log("Instance ID changed:", instanceId, user);
    if (instanceId !== "undefined" && !user) {
      const userStorage = sessionStorage.getItem(
        `weave.js_standalone_templates_${instanceId}`,
      );
      try {
        const userMapped = JSON.parse(userStorage ?? "");
        if (userMapped) {
          setUser(userMapped);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, user]);

  if (instanceId === "undefined") {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/20 flex flex-col justify-center items-center">
        <div className="flex flex-col gap-1 justify-center items-center bg-white p-5">
          <ScaleLoader />
          <div className="font-inter text-xl">LOADING</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!user && (
        <>
          <PageLoader
            key="loader"
            instanceId={instanceId}
            content={
              <>
                <div className="text-center text-[#cc0000]">
                  <p>TEMPLATES EXAMPLE</p>
                </div>
                <div className="text-center">
                  <p>ENTER YOUR USERNAME</p>
                </div>
              </>
            }
            description={
              <div className="w-full">
                <UserForm />
              </div>
            }
          />
        </>
      )}
      <div className="w-full h-full">
        <div className="w-full h-[65px] p-5 py-3 border-b border-[#c9c9c9] flex justify-between items-center">
          <div className="flex gap-2 justify-start items-center">
            <Menu />
            <div className="font-inter text-xl">{instanceId}</div>
          </div>
          <div className="flex gap-1">
            {!templatesManage && (
              <>
                {/* <button className="bg-[#2563EB] text-white p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-[#1D4ED8]">
              CREATE TEMPLATE <LayoutPanelTop size={20} strokeWidth={1} />
            </button> */}
                <button className="bg-black text-white p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-gray-800">
                  UPLOAD RESOURCES <CloudUpload size={20} strokeWidth={1} />
                </button>
              </>
            )}
            {templatesManage && (
              <>
                {/* <button className="bg-[#2563EB] text-white p-2 px-5 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-[#1D4ED8]">
              CREATE TEMPLATE <LayoutPanelTop size={20} strokeWidth={1} />
            </button> */}
                <button
                  className="p-2 flex justify-center items-center gap-2 rounded-none cursor-pointer hover:bg-[#c9c9c9]"
                  onClick={() => {
                    setTemplatesManage(!templatesManage);
                  }}
                >
                  <X size={20} strokeWidth={1} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="w-full h-full grid grid-cols-12 border">
          {!templatesManage && (
            <div className="col-span-12">
              <Resources />
            </div>
          )}
          {templatesManage && (
            <div className="col-span-12">
              <Templates />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
