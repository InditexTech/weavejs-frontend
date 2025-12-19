// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { motion } from "motion/react";
import { Logo } from "@/components/utils/logo";
import LoginForm from "./login-form";
import { Info, Eye, EyeOff, ExternalLink, X } from "lucide-react";
import { DOCUMENTATION_URL, GITHUB_URL } from "@/lib/constants";
import weavePackage from "@/node_modules/@inditextech/weave-sdk/package.json";
import weaveReactHelperPackage from "@/node_modules/@inditextech/weave-react/package.json";
import weaveStorePackage from "@/node_modules/@inditextech/weave-store-azure-web-pubsub/package.json";
import { Button } from "@/components/ui/button";

export const StandaloneHomePage = () => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <>
      <main className="w-full h-full flex justify-center items-center relative">
        <motion.section
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex h-full w-full flex-col items-center justify-start lg:justify-center overflow-auto"
        >
          <div className="max-w-full lg:max-w-[500px] w-[calc(100dvw-24px)] h-dvh lg:h-auto flex flex-col items-center justify-between gap-3 lg:gap-6 m-3">
            <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-2 lg:left-8 lg:top-8 bg-background p-8 border border-[#c9c9c9]">
              <Logo kind="landscape" variant="no-text" />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-end justify-center"
              >
                <h1 className="text-3xl font-inter font-light text-muted-foreground uppercase text-right">
                  SHOWCASE
                </h1>
                <h2 className="text-xl font-inter font-light text-muted-foreground uppercase !text-[#cc0000] text-right">
                  STANDALONE
                  <br />
                  USE CASE
                </h2>
              </motion.div>
            </div>
            <div className="w-full h-full lg:h-auto flex flex-col gap-2 items-center justify-center bg-background p-8 border border-[#c9c9c9]">
              <LoginForm />
            </div>
            <div className="w-full flex flex-col gap-2 items-center justify-center bg-background p-8 py-2 border border-[#c9c9c9]">
              <div className="flex flex-col lg:flex-row gap-0 lg:gap-2 justify-center-items-center">
                <Button
                  variant="link"
                  onClick={() => {
                    window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
                  }}
                  className="cursor-pointer font-inter font-light"
                >
                  <ExternalLink strokeWidth={1} /> GITHUB
                </Button>
                <Button
                  variant="link"
                  onClick={() => {
                    window.open(
                      DOCUMENTATION_URL,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  className="cursor-pointer font-inter font-light"
                >
                  <ExternalLink strokeWidth={1} /> DOCUMENTATION
                </Button>
                <Button
                  variant="link"
                  onClick={() => {
                    setShowDetails((prev) => !prev);
                  }}
                  className="cursor-pointer font-inter font-light"
                >
                  {!showDetails ? (
                    <Eye strokeWidth={1} />
                  ) : (
                    <EyeOff strokeWidth={1} />
                  )}{" "}
                  DEPENDENCIES
                </Button>
              </div>
            </div>
            {showDetails && (
              <div className="w-[calc(100dvw-24px)] lg:w-auto absolute bottom-3 right-3 lg:bottom-8 lg:right-8 flex flex-col items-start justify-center bg-background p-5 pt-3 border border-[#c9c9c9]">
                <div className="w-full flex gap-2 justify-between items-center mb-5 uppercase">
                  <div className="flex gap-2 justify-start items-center font-inter font-light text-sm">
                    <Info strokeWidth={1} size={16} />
                    Dependencies Used
                  </div>
                  <Button
                    variant="link"
                    onClick={() => {
                      setShowDetails(false);
                    }}
                    className="cursor-pointer font-inter font-light"
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
                    <code>@inditextech/weave-store-azure-web-pubsub</code>
                  </div>
                  <div className="flex gap-1 justify-center items-center">
                    <code className="bg-[#e9e9e9] px-2 py-1">
                      v{weaveStorePackage.version}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </main>
      <Toaster
        offset={16}
        mobileOffset={16}
        toastOptions={{
          classNames: {
            toast: "w-full font-inter font-light text-xs",
            content: "w-full",
            title: "w-full font-inter font-semibold text-sm",
            description: "w-full font-inter font-light text-xs !text-black",
          },
          style: {
            borderRadius: "0px",
            boxShadow: "none",
          },
        }}
      />
    </>
  );
};
