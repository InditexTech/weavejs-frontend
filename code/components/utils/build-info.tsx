// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import packageJson from "@/package.json";

type BuildInfoProps = {
  className?: string;
};

export const BuildInfo = ({ className }: Readonly<BuildInfoProps>) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col justify-start items-start gap-1 text-muted-foreground",
        className,
      )}
    >
      <Badge variant="outline" className="text-xs font-mono cursor-default">
        version:{packageJson.version}
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="text-xs font-mono cursor-default"
            >
              build:{(__GIT_SHA__ ?? "").slice(0, 7)}.{__GIT_RUN_ID__}.
              {__GIT_RUN_ATTEMPT__}
            </Badge>
          </TooltipTrigger>
          <TooltipContent
            align="start"
            side="top"
            sideOffset={4}
            className="rounded-none"
          >
            <p>
              <b>Github full SHA</b>
            </p>
            <p>{__GIT_SHA__}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
