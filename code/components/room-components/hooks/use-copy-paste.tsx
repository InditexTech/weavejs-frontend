// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  WeaveCopyPasteNodesPluginOnCopyEvent,
  WeaveCopyPasteNodesPluginOnPasteEvent,
} from "@inditextech/weave-sdk";
import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { toast } from "sonner";

function useCopyPaste() {
  const copyingToastIdRef = React.useRef<string | number | null>(null);

  const instance = useWeave((state) => state.instance);

  const onPrepareCopyHandler = React.useCallback((): void => {
    copyingToastIdRef.current = toast.loading("Copying...");
  }, []);

  const onCopyHandler = React.useCallback(
    (copyInfo: WeaveCopyPasteNodesPluginOnCopyEvent): void => {
      if (copyInfo?.error) {
        console.error("onCopy", copyInfo.error);
        toast.error("An error occurred when copying to the clipboard");
      } else {
        toast.success("Copy successful");
      }

      if (copyingToastIdRef.current) {
        toast.dismiss(copyingToastIdRef.current);
        copyingToastIdRef.current = null;
      }
    },
    []
  );

  const onPasteHandler = React.useCallback(
    (pasteInfo: WeaveCopyPasteNodesPluginOnPasteEvent): void => {
      const { error } = pasteInfo;

      if (error) {
        if (error.message === "Invalid elements to paste") {
          toast.warning("Elements in clipboard cannot be pasted here");
        } else {
          console.error("onPaste", error);
          toast.error("An error occurred when reading from the clipboard");
        }
      } else {
        toast.success("Paste successful");
      }
    },
    []
  );

  React.useEffect(() => {
    if (!instance) return;

    instance.addEventListener("onPrepareCopy", onPrepareCopyHandler);
    instance.addEventListener("onCopy", onCopyHandler);
    instance.addEventListener("onPaste", onPasteHandler);

    return () => {
      instance.removeEventListener("onPrepareCopy", onPrepareCopyHandler);
      instance.removeEventListener("onCopy", onCopyHandler);
      instance.removeEventListener("onPaste", onPasteHandler);
    };
  }, [instance, onPrepareCopyHandler, onCopyHandler, onPasteHandler]);
}

export default useCopyPaste;
