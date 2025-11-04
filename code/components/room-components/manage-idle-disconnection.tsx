// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWeave } from "@inditextech/weave-react";
import { useIdleDetectionUser } from "./hooks/use-idle-detection-user";
import { useCollaborationRoom } from "@/store/store";

const TIME_UNTIL_DISCONNECTION_SECONDS = 20; // 20 seconds

export const ManageIdleDisconnection = () => {
  const router = useRouter();

  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const timeElapsedIntervalRef = React.useRef<NodeJS.Timeout | undefined>(
    undefined
  );
  const [disconnectionStarted, setDisconnectionStarted] =
    React.useState<boolean>(false);

  const [disconnectionCounter, setDisconnectionCounter] =
    React.useState<number>(0);

  const [showIdleWarning, setShowIdleWarning] = React.useState(false);

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);

  const userInactive = useIdleDetectionUser();

  React.useEffect(() => {
    if (!instance) return;

    if (userInactive && !disconnectionStarted) {
      setDisconnectionStarted(true);
      setDisconnectionCounter(TIME_UNTIL_DISCONNECTION_SECONDS);
      setShowIdleWarning(true);
      timeoutRef.current = setTimeout(() => {
        setShowIdleWarning(false);
        sessionStorage.removeItem(`weave.js_${room}`);
        instance?.getStore().disconnect();
        router.push("/");
      }, TIME_UNTIL_DISCONNECTION_SECONDS * 1000);
      timeElapsedIntervalRef.current = setInterval(() => {
        setDisconnectionCounter((prev) => prev - 1);
      }, 1000);
    }
  }, [instance, router, room, userInactive, disconnectionStarted]);

  if (!showIdleWarning) {
    return null;
  }

  return (
    <Dialog
      open={showIdleWarning}
      onOpenChange={(open) => setShowIdleWarning(open)}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-full flex gap-5 justify-between items-center">
            <DialogTitle className="font-inter text-2xl font-normal uppercase">
              Inactivity Detected
            </DialogTitle>
          </div>
          <DialogDescription className="font-inter text-sm mt-5">
            We&apos;ve detected inactivity on the room, you will be disconnected
            in 20 seconds. Press the button to cancel.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            <div className="font-inter text-sm">
              {disconnectionCounter} seconds remaining...
            </div>
            <Button
              type="button"
              size="sm"
              variant="default"
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                clearTimeout(timeoutRef.current);
                clearInterval(timeElapsedIntervalRef.current);
                setDisconnectionStarted(false);
                setDisconnectionCounter(0);
                setShowIdleWarning(false);
              }}
            >
              CANCEL
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
