// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { postValidatePassword } from "@/api/post-validate-password";
import { X } from "lucide-react";
import { useIAChat } from "@/store/ia-chat";

export function LlmSetupDialog() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [password, setPassword] = React.useState<string>("");

  const setAiChatEnabled = useIAChat((state) => state.setEnabled);
  const setupVisible = useIAChat((state) => state.setup.visible);
  const setAiChatSetupVisible = useIAChat((state) => state.setSetupVisible);
  const setAiChatSetupState = useIAChat((state) => state.setSetupState);

  React.useEffect(() => {
    if (setupVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [setupVisible]);

  const mutationGenerate = useMutation({
    mutationFn: async (password: string) => {
      setAiChatSetupState("validating");
      return await postValidatePassword(password);
    },
    onSettled: () => {
      setAiChatSetupState("idle");
    },
    onSuccess: () => {
      toast.success("Setup AI capabilities", {
        description: "You have successfully enabled AI capabilities.",
      });
      sessionStorage.setItem("weave_ai_chat_enabled", "true");
      sessionStorage.setItem("weave_ai_chat_password", password);
      setAiChatSetupVisible(false);
      setAiChatEnabled(true);
    },
    onError() {
      toast.error("Setup AI capabilities", {
        description:
          "Failed to enable AI capabilities. Please check and try again.",
      });
      sessionStorage.setItem("weave_ai_chat_enabled", "false");
      setAiChatEnabled(false);
    },
  });

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      if (!setupVisible) return;

      if (event.key === "Enter") {
        mutationGenerate.mutate(password);
      }
    },
    [password, setupVisible, mutationGenerate]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={setupVisible}
      onOpenChange={(open) => setAiChatSetupVisible(open)}
    >
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
                    setAiChatSetupVisible(false);
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
                ref={inputRef}
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
          </div>
          <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
          <DialogFooter>
            <Button
              type="button"
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
