// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import useHandleRouteParams from "../../hooks/use-handle-route-params";
import { useStandaloneUseCase } from "../../store/store";
import { Comments } from "../comment/comments";
import { ImageCanvas } from "../image-canvas/image-canvas";
import { Images } from "../images/images";
import { PageLoader } from "./page-loader";
import UserForm from "./user-form";
import { ScaleLoader } from "react-spinners";

export const StandalonePage = () => {
  useHandleRouteParams();

  const user = useStandaloneUseCase((state) => state.user);
  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const setUser = useStandaloneUseCase((state) => state.setUser);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const imageUploading = useStandaloneUseCase(
    (state) => state.images.uploading
  );
  const showComments = useStandaloneUseCase((state) => state.comments.show);

  React.useEffect(() => {
    if (instanceId && !user) {
      const userStorage = sessionStorage.getItem(
        `weave.js_standalone_${instanceId}`
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
    return <div>Loading...</div>;
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
                <div className="text-center">
                  <p>STANDALONE EXAMPLE</p>
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
        <div className="w-full h-full grid grid-cols-12 border">
          <div className="col-span-2 border-r border-[#c9c9c9] flex flex-col">
            <div className="w-full h-[65px] p-5 py-3 border-b border-[#c9c9c9] flex justify-between items-center">
              <div className="font-inter text-xl">{instanceId}</div>
              <div className="font-inter text-sm">
                {user ? `@${user.name}` : "-"}
              </div>
            </div>
            <Images />
          </div>
          <div
            className={cn("col-span-10 w-full h-full relative", {
              ["col-span-8"]: showComments,
            })}
          >
            {managingImageId !== null && <ImageCanvas key={managingImageId} />}
            {managingImageId === null && (
              <div className="w-full h-full flex justify-center items-center">
                Select an image to start managing it.
              </div>
            )}
          </div>
          {managingImageId && (
            <div className="col-span-2 border-l border-[#c9c9c9] flex flex-col">
              <Comments />
            </div>
          )}
        </div>
      </div>
      {imageUploading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/20 flex flex-col justify-center items-center">
          <div className="flex flex-col gap-1 justify-center items-center bg-white p-5">
            <ScaleLoader />
            <div className="font-inter text-xl">uploading image</div>
          </div>
        </div>
      )}
    </>
  );
};
