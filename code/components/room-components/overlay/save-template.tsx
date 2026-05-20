// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

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
import { X } from "lucide-react";
import { useTemplates } from "@/store/templates";
import { useWeave } from "@inditextech/weave-react";
import { WEAVE_EXPORT_RETURN_FORMAT } from "@inditextech/weave-types";
import { WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { postTemplate } from "@/api/post-template";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import Konva from "konva";
import { cn, sleep } from "@/lib/utils";
import { useJsonTemplate } from "../hooks/use-json-template";

export function SaveTemplateDialog() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const room = useCollaborationRoom((state) => state.room);
  const viewType = useCollaborationRoom((state) => state.viewType);
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );

  const [templateData, setTemplateData] = React.useState<string | null>(null);
  const [templateImage, setTemplateImage] = React.useState<string | undefined>(
    undefined,
  );
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [generatingImagePreview, setGeneratingImagePreview] =
    React.useState<boolean>(false);
  const [linkedNodeType, setLinkedNodeType] = React.useState<string>("none");
  const [name, setName] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);

  const templateJsonData = useTemplates((state) => state.data);
  const saveDialogKind = useTemplates((state) => state.saveDialog.kind);
  const saveDialogVisible = useTemplates((state) => state.saveDialog.visible);
  const setSaveDialogVisible = useTemplates(
    (state) => state.setSaveDialogVisible,
  );

  const instance = useWeave((state) => state.instance);

  const { getTemplateNodesMetadata } = useJsonTemplate();

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
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

      const selectionPreviewURL = (await instance.exportNodes(
        selectedNodes,
        (nodes: Konva.Node[]) => nodes,
        {
          format: "image/png",
          padding: 40,
          backgroundColor: "#D6D6D6",
          pixelRatio: 1,
        },
        WEAVE_EXPORT_RETURN_FORMAT.DATA_URL,
      )) as string;

      await sleep(1000);

      setGeneratingImagePreview(false);
      setTemplateImage(selectionPreviewURL);
    }

    if (saveDialogVisible) {
      setTemplateImage(undefined);
      getSelectionPreviewImage();
      setLinkedNodeType("none");
      setInitialized(true);
    }

    return () => {
      setInitialized(false);
    };
  }, [saveDialogVisible, instance]);

  React.useEffect(() => {
    try {
      setTemplateData(JSON.stringify(templateJsonData));
    } catch {
      setTemplateData(null);
    }
  }, [templateJsonData]);

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
      if (!saveDialogKind) {
        throw new Error("Template kind is not defined");
      }

      setSaving(true);
      return await postTemplate({
        roomId: room ?? "",
        name,
        kind: saveDialogKind,
        imageSlots: saveDialogKind === "imageTemplate" ? editableNodes : 0,
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
    (e: any) => {
      if (!saveDialogVisible) return;

      if (!templateData) return;

      if (!templateImage) return;

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        mutationGenerate.mutate({
          name,
          templateImage,
          templateData,
        });
      }
    },
    [name, templateImage, templateData, saveDialogVisible, mutationGenerate],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  const editableNodes = React.useMemo(() => {
    if (!templateJsonData) return 0;

    if (saveDialogKind === "template") {
      return 0;
    }

    const metadata = getTemplateNodesMetadata(templateJsonData);
    return metadata.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m.editable && ["image", "text"].includes(m.kind),
    ).length;
  }, [saveDialogKind, templateJsonData]);

  return (
    <>
      <Dialog
        open={initialized && saveDialogVisible && !generatingImagePreview}
        onOpenChange={(open) => setSaveDialogVisible(open)}
      >
        <form>
          <DialogContent className="sm:max-w-[600px]">
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
                    <div className="font-inter text-xs max-w-[550px] h-[550px] border-[#c9c9c9] bg-[#d6d6d6] flex justify-center items-center">
                      generating selection thumbnail...
                    </div>
                  )}
                  {!generatingImagePreview && (
                    <img
                      alt="Template preview"
                      className="aspect-video border max-w-[550px] h-[550px] border-[#c9c9c9] bg-[#d6d6d6] w-full object-contain"
                      src={templateImage}
                    />
                  )}
                </div>
                <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
                <Label htmlFor="templateName" className="font-medium">
                  Template name:
                </Label>
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
                {saveDialogKind === "imageTemplate" && (
                  <>
                    <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm">Editable nodes</div>
                      <div className="font-light text-sm">{editableNodes}</div>
                    </div>
                  </>
                )}
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
                disabled={
                  saving ||
                  name.trim() === "" ||
                  generatingImagePreview ||
                  !templateData
                }
                className="cursor-pointer font-inter rounded-none"
                onClick={() => {
                  if (!templateImage) return;

                  if (!templateData) return;

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
      {generatingImagePreview && (
        <div
          className={cn(
            "absolute bg-white z-[49] flex flex-col justify-center items-center",
            {
              ["top-0 left-[400px] right-[400px] bottom-[40px]"]:
                viewType === "fixed",
              ["top-[54.5px] left-[0px] right-[0px] bottom-[40px]"]:
                viewType === "floating",
            },
          )}
        >
          <div className="font-light text-xl">GENERATING TEMPLATE PREVIEW</div>
          <div className="font-light text-base">please wait...</div>
        </div>
      )}
    </>
  );
}
