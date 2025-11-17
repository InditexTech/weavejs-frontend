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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useTemplates } from "@/store/templates";
import { useWeave } from "@inditextech/weave-react";
import { getImageBase64 } from "@/components/utils/images";
import { WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { postTemplate } from "@/api/post-template";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { getSelectionAsTemplate } from "@/components/utils/templates";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";

export function SaveTemplateDialog() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const room = useCollaborationRoom((state) => state.room);
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const [templateData, setTemplateData] = React.useState<string>("");
  const [templateImage, setTemplateImage] = React.useState<string | undefined>(
    undefined
  );
  const [generatingImagePreview, setGeneratingImagePreview] =
    React.useState<boolean>(false);
  const [linkedNodeType, setLinkedNodeType] = React.useState<string>("none");
  const [name, setName] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);

  const saveDialogVisible = useTemplates((state) => state.saveDialog.visible);
  const setSaveDialogVisible = useTemplates(
    (state) => state.setSaveDialogVisible
  );

  const instance = useWeave((state) => state.instance);

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
  );

  React.useEffect(() => {
    if (!instance) return;

    async function getSelectionPreviewImage(): Promise<void> {
      if (!instance) {
        setTemplateImage(undefined);
        return;
      }

      const nodesSelectionPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
      const selectedNodes = nodesSelectionPlugin?.getSelectedNodes();

      if (!selectedNodes || selectedNodes.length === 0) {
        setTemplateImage(undefined);
        return;
      }

      setGeneratingImagePreview(true);
      const selectionPreview = await getImageBase64({
        instance,
        nodes: selectedNodes.map((node) => node.getAttrs().id ?? ""),
        options: {
          format: "image/png",
          padding: 40,
          backgroundColor: "#D6D6D6",
          pixelRatio: 1,
        },
      });
      setGeneratingImagePreview(false);
      setTemplateImage(selectionPreview.url);

      const template = getSelectionAsTemplate(instance);
      setTemplateData(JSON.stringify(template));
    }

    setTemplateImage(undefined);
    getSelectionPreviewImage();
    if (saveDialogVisible) {
      setLinkedNodeType("none");
    }
  }, [saveDialogVisible, instance]);

  React.useEffect(() => {
    if (saveDialogVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
    if (!generatingImagePreview) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [saveDialogVisible, generatingImagePreview]);

  const mutationGenerate = useMutation({
    mutationFn: async ({
      name,
      templateImage,
      templateData,
    }: {
      name: string;
      templateImage: string;
      templateData: string;
    }) => {
      if (!room) {
        throw new Error("Room is not defined");
      }
      setSaving(true);
      return await postTemplate({
        roomId: room ?? "",
        name,
        linkedNodeType: linkedNodeType,
        templateImage,
        templateData,
      });
    },
    onSettled: () => {
      setSaving(false);
    },
    onSuccess: () => {
      toast.success("Templates", {
        description: "You have successfully save the template.",
      });

      setName("");
      setLinkedNodeType("none");
      setTemplateImage(undefined);
      setTemplateData("");

      setSaveDialogVisible(false);
      if (linkedNodeType === "none") {
        sidebarToggle(SIDEBAR_ELEMENTS.templates);
      }
    },
    onError() {
      toast.error("Templates", {
        description: "Failed to save the template. Please check and try again.",
      });
    },
  });

  const onKeyDown = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      if (!saveDialogVisible) return;

      if (!templateImage) return;

      if (event.key === "Enter") {
        mutationGenerate.mutate({
          name,
          templateImage,
          templateData,
        });
      }
    },
    [name, templateImage, templateData, saveDialogVisible, mutationGenerate]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Dialog
      open={saveDialogVisible}
      onOpenChange={(open) => setSaveDialogVisible(open)}
    >
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="w-full flex gap-5 justify-between items-center">
              <DialogTitle className="font-inter text-2xl font-normal uppercase">
                Save as Template
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    setSaveDialogVisible(false);
                  }}
                >
                  <X size={16} strokeWidth={1} />
                </button>
              </DialogClose>
            </div>
            <DialogDescription className="font-inter text-sm mt-5">
              Save the selection as a template for future use.
            </DialogDescription>
            <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <div>
                {generatingImagePreview && (
                  <div className="font-inter text-xs max-w-[375px] h-[300px] border-[#c9c9c9] bg-[#d6d6d6] flex justify-center items-center">
                    generating selection thumbnail...
                  </div>
                )}
                {!generatingImagePreview && (
                  <img
                    className="aspect-video border max-w-[375px] h-[300px] border-[#c9c9c9] bg-[#d6d6d6] w-full object-contain"
                    src={templateImage}
                  />
                )}
              </div>
              <Label htmlFor="templateName font-inter font-xs">Name:</Label>
              <Input
                ref={inputRef}
                id="templateName"
                name="templateName"
                type="text"
                disabled={generatingImagePreview}
                value={name}
                onFocus={() => {
                  window.weaveOnFieldFocus = true;
                }}
                onBlurCapture={() => {
                  window.weaveOnFieldFocus = false;
                }}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
              />
              <Label htmlFor="linkedNodeType" className="font-inter font-xs">
                Linked Node Type:
              </Label>
              <Select
                value={linkedNodeType}
                onValueChange={setLinkedNodeType}
                disabled={generatingImagePreview}
              >
                <SelectTrigger
                  id="linkedNodeType"
                  className="w-full font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none"
                >
                  <SelectValue placeholder="Linked Node Type" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
                  align="end"
                >
                  <SelectGroup>
                    <SelectItem
                      value="none"
                      className="font-inter text-xs rounded-none"
                    >
                      None
                    </SelectItem>
                    <SelectItem
                      value="frame"
                      className="font-inter text-xs rounded-none"
                    >
                      Frame
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer font-inter rounded-none"
              onClick={() => setSaveDialogVisible(false)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              disabled={saving || name.trim() === "" || generatingImagePreview}
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                if (!templateImage) return;

                mutationGenerate.mutate({
                  name,
                  templateImage,
                  templateData,
                });
              }}
            >
              SAVE
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
