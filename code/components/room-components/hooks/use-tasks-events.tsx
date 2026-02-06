// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import React from "react";
import ReconnectingWebsocket from "reconnecting-websocket";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import { eventBus } from "@/components/utils/events-bus";
import { getCommBusNegotiate } from "@/api/get-comm-bus-negotiate";
import { postCommBusJoin } from "@/api/post-comm-bus-join";

export const useTasksEvents = () => {
  const toastRef = React.useRef<string | number | null>(null);

  const [initializedCommBus, setInitializedCommBus] =
    React.useState<boolean>(false);
  const room = useCollaborationRoom((state) => state.room);
  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const setClientId = useCollaborationRoom((state) => state.setClientId);
  const setCommBusConnected = useCollaborationRoom(
    (state) => state.setCommBusConnected,
  );
  const setImageExporting = useCollaborationRoom(
    (state) => state.setImageExporting,
  );
  const setFramesExporting = useCollaborationRoom(
    (state) => state.setFramesExporting,
  );
  const queryClient = useQueryClient();

  const getCommBusUrl = useMutation({
    mutationFn: () => getCommBusNegotiate(room ?? "", user?.name ?? ""),
  });

  React.useEffect(() => {
    if (typeof clientId === "undefined") {
      setClientId(uuidv4());
      return;
    }
  }, [clientId, setClientId]);

  React.useEffect(() => {
    if (initializedCommBus) {
      return;
    }

    if (!room || !user?.name) {
      return;
    }

    async function connectToRoomCoomBus() {
      if (!room || !user?.name) {
        return;
      }

      const ws = new ReconnectingWebsocket(async () => {
        const { url } = await getCommBusUrl.mutateAsync();
        console.log("🔌 Connecting comm-bus");

        return url;
      });

      ws.onclose = () => console.log("🔌 closed");

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        const type = message.type;
        const messageClientId = message.clientId;
        const messageUserId = message.userId;

        if (type.startsWith("comment")) {
          eventBus.emit("onCommentsChanged");
        }

        if (
          [
            "addImage",
            "generateImages",
            "editImage",
            "editImageMask",
            "editImageReferences",
            "deleteImage",
            "removeImageBackground",
            "negateImage",
            "flipImage",
            "grayscaleImage",
          ].includes(type)
        ) {
          const queryKey = ["getImages", room];
          queryClient.invalidateQueries({ queryKey });
        }

        if (["saveTemplate", "deleteTemplate"].includes(type)) {
          const queryKey = ["getTemplates", room];
          queryClient.invalidateQueries({ queryKey });
        }

        if (["deleteVideo"].includes(type)) {
          const queryKey = ["getVideos", room];
          queryClient.invalidateQueries({ queryKey });
        }

        if (
          ["exportImage"].includes(type) &&
          messageClientId === clientId &&
          messageUserId === user.id
        ) {
          const status = message.status;

          switch (status) {
            case "created": {
              if (toastRef.current) {
                toast.dismiss(toastRef.current);
              }
              toastRef.current = toast.loading("Export to image requested.", {
                duration: Infinity,
              });
              break;
            }
            case "active": {
              if (toastRef.current) {
                toastRef.current = toast.loading(
                  "Exporting to image processing.",
                  {
                    id: toastRef.current,
                    duration: Infinity,
                  },
                );
              }
              break;
            }
            case "completed": {
              if (toastRef.current) {
                toast.success("Export to image completed.", {
                  id: toastRef.current,
                  duration: 4000,
                });

                const url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/export/${message.data.exportedImageId}?responseType=${message.data.responseType}`;

                const res = await fetch(url);
                const blob = await res.blob();

                const objectUrl = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = objectUrl;
                if (message.data.responseType === "zip") {
                  a.download = "export.zip";
                } else if (message.data.responseType === "blob") {
                  a.download = "export.png";
                }
                a.click();

                URL.revokeObjectURL(objectUrl);

                setImageExporting(false);
              }
              toastRef.current = null;
              break;
            }
            case "failed": {
              if (toastRef.current) {
                toast.error("Export to image failed.", {
                  id: toastRef.current,
                  duration: 4000,
                });

                setImageExporting(false);
              }
              toastRef.current = null;
              break;
            }
            default:
              break;
          }
        }

        if (
          ["exportPdf"].includes(type) &&
          messageClientId === clientId &&
          messageUserId === user.id
        ) {
          const status = message.status;

          switch (status) {
            case "created": {
              if (toastRef.current) {
                toast.dismiss(toastRef.current);
              }
              toastRef.current = toast.loading(
                "Export frames to PDF requested.",
                {
                  duration: Infinity,
                },
              );
              break;
            }
            case "active": {
              if (toastRef.current) {
                toastRef.current = toast.loading(
                  "Exporting frames to PDF processing.",
                  {
                    id: toastRef.current,
                    duration: Infinity,
                  },
                );
              }
              break;
            }
            case "completed": {
              if (toastRef.current) {
                toast.success("Export frames to PDF completed.", {
                  id: toastRef.current,
                  duration: 4000,
                });

                const url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/export/pdf/${message.data.exportedPdfId}?responseType=${message.data.responseType}`;

                const res = await fetch(url);
                const blob = await res.blob();

                const objectUrl = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = objectUrl;
                if (message.data.responseType === "zip") {
                  a.download = "export.zip";
                } else if (message.data.responseType === "blob") {
                  a.download = "export.pdf";
                }
                a.click();

                URL.revokeObjectURL(objectUrl);

                setFramesExporting(false);
              }
              toastRef.current = null;
              break;
            }
            case "failed": {
              if (toastRef.current) {
                toast.error("Export frames to PDF failed.", {
                  id: toastRef.current,
                  duration: 4000,
                });

                setFramesExporting(false);
              }
              toastRef.current = null;
              break;
            }
            default:
              break;
          }
        }
      };

      ws.onerror = (err) => console.error("❌ error", err);

      ws.onopen = async () => {
        console.log("✅ Connected comm-bus");

        console.log(`🔌 Join Room ${room}`);

        await postCommBusJoin(room, user?.name ?? "");

        console.log(`✅ Room ${room} joined on comm-bus`);

        setCommBusConnected(true);
      };

      setInitializedCommBus(true);
    }

    connectToRoomCoomBus();
  }, [
    initializedCommBus,
    getCommBusUrl,
    room,
    user?.name,
    setCommBusConnected,
    queryClient,
    clientId,
    user?.id,
    setFramesExporting,
    setImageExporting,
  ]);
};
