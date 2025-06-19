import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
            <DialogTitle className="font-inter text-2xl">
              Setup IA Capabilities
            </DialogTitle>
            <DialogDescription className="font-inter text-sm">
              Enable the IA capabilities to use the LLM generator and other
              features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="password font-inter ">Password</Label>
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
                className="font-inter font-light rounded-none border-black"
              />
            </div>
            {error && (
              <div className="font-inter text-base text-[#FDB4BB]">
                Invalid password, please try again
              </div>
            )}
          </div>
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
