// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIACapabilities } from "@/store/ia";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { postValidatePassword } from "@/api/post-validate-password";
import { X } from "lucide-react";

export function LlmSetupDialog() {
  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<Error | null>(null);

  const setupVisible = useIACapabilities((state) => state.setup.visible);
  const setAIEnabled = useIACapabilities((state) => state.setEnabled);
  const setSetupVisible = useIACapabilities((state) => state.setSetupVisible);
  const setSetupState = useIACapabilities((state) => state.setSetupState);

  const mutationGenerate = useMutation({
    mutationFn: async (password: string) => {
      setSetupState("validating");
      return await postValidatePassword(password);
    },
    onSettled: () => {
      setSetupState("idle");
    },
    onSuccess: () => {
      sessionStorage.setItem("weave_ai_enabled", "true");
      sessionStorage.setItem("weave_ai_password", password);
      setSetupVisible(false);
      setAIEnabled(true);
    },
    onError(error) {
      sessionStorage.setItem("weave_ai_enabled", "false");
      setError(error);
      setAIEnabled(false);
    },
  });

  return (
    <Dialog open={setupVisible} onOpenChange={(open) => setSetupVisible(open)}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Setup AI Capabilities
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setSetupVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
            <DialogDescription className="font-inter text-sm mt-5">
              Enable the AI capabilities to use image editing features.
            </DialogDescription>
            <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="password font-inter font-xs">Password:</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onFocus={() => {
                  window.weaveOnFieldFocus = true;
                }}
                onBlurCapture={() => {
                  window.weaveOnFieldFocus = false;
                }}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
              />
            </div>
            {error && (
              <div className="font-inter text-base text-[#FDB4BB]">
                Invalid password, please try again
              </div>
            )}
          </div>
          <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
          <DialogFooter>
            <Button
              type="submit"
              className="cursor-pointer font-inter rounded-none"
              onClick={() => mutationGenerate.mutate(password)}
            >
              ENABLE
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
