// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type ShowcaseUserIdProps = {
  userId: string;
};

export const ShowcaseUserId = ({ userId }: ShowcaseUserIdProps) => {
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success("User ID copied to clipboard");
    } catch {
      toast.error("Could not copy the user ID");
    }
  }, [userId]);

  return (
    <div className="w-full flex items-center gap-2 text-xs font-light text-muted-foreground">
      <span className="shrink-0">User ID</span>
      <code className="font-mono truncate" title={userId}>
        {userId}
      </code>
      <button
        type="button"
        aria-label="Copy user ID"
        className="cursor-pointer shrink-0"
        onClick={handleCopy}
      >
        <Copy size={14} strokeWidth={1} />
      </button>
    </div>
  );
};
