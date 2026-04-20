// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Emittery from "emittery";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import React from "react";
import ReconnectingWebsocket from "reconnecting-websocket";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCollaborationRoom } from "@/store/store";
import { eventBus } from "@/components/utils/events-bus";
import { getCommBusNegotiate } from "@/api/get-comm-bus-negotiate";
import { postCommBusJoin } from "@/api/post-comm-bus-join";
import { useGetSession } from "./use-get-session";

type Member = {
  clientId: string;
  lastSeen: number;
};

const emitter = new Emittery();

const HEARTBEAT_TIMEOUT = 4000; // 4 seconds

function cleanupMembers(members: Map<string, Member>) {
  const now = Date.now();

  for (const [id, member] of members.entries()) {
    if (now - member.lastSeen > HEARTBEAT_TIMEOUT) {
      members.delete(id);
    }
  }
}

function electLeader(members: Map<string, Member>) {
  const alive = [...members.entries()]
    .filter(([, { lastSeen }]) => Date.now() - lastSeen < HEARTBEAT_TIMEOUT)
    .map(([id]) => id);

  if (alive.length === 0) return null;

  return alive.sort()[0];
}

export const getEmmiter = () => {
  return emitter;
};

export const useTasksEvents = () => {
  const intervalIdRef = React.useRef<NodeJS.Timeout | null>(null);
  const pageMembersRef = React.useRef<Record<string, Map<string, Member>>>({});
  const toastExportPageToImageRef = React.useRef<string | number | null>(null);
  const toastExportRoomToPdfRef = React.useRef<string | number | null>(null);
  const toastExportFramesToPdfRef = React.useRef<string | number | null>(null);

  const [initializedCommBus, setInitializedCommBus] =
    React.useState<boolean>(false);
  const [actualRoomPage, setActualRoomPage] = React.useState<string | null>(
    null,
  );
  const [bus, setBus] = React.useState<ReconnectingWebsocket | null>(null);

  const room = useCollaborationRoom((state) => state.room);
  const pageId = useCollaborationRoom((state) => state.pages.actualPageId);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const commBusConnected = useCollaborationRoom(
    (state) => state.commBus.connected,
  );
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
  const setPresentationStatus = useCollaborationRoom(
    (state) => state.setPresentationStatus,
  );
  const setPresentationInstanceId = useCollaborationRoom(
    (state) => state.setPresentationInstanceId,
  );
  const setPresentationPagesStatus = useCollaborationRoom(
    (state) => state.setPresentationPagesStatus,
  );
  const setLeaderId = useCollaborationRoom((state) => state.setLeaderId);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const roomInfoLoaded = useCollaborationRoom((state) => state.roomInfo.loaded);
  const roomInfoError = useCollaborationRoom((state) => state.roomInfo.error);

  const { session } = useGetSession();

  const queryClient = useQueryClient();

  const getCommBusUrl = useMutation({
    mutationFn: () => getCommBusNegotiate(room ?? "", session?.user.id ?? ""),
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

    if (
      !pageId ||
      !session?.user.id ||
      !roomInfo ||
      !roomInfoLoaded ||
      roomInfoError
    ) {
      return;
    }

    async function connectToRoomCoomBus() {
      if (!pageId || !session?.user.id) {
        return;
      }

      const ws = new ReconnectingWebsocket(async () => {
        const { url } = await getCommBusUrl.mutateAsync();
        console.log("🔌 [Comm-Bus] connecting", url);
        return url;
      }, "json.webpubsub.azure.v1");

      setBus(ws);

      ws.onclose = (e) => {
        setActualRoomPage(null);
        console.log(`🚫 [Comm-Bus] closed, code: ${e.code}`);
      };

      ws.onmessage = async (event) => {
        const payload = JSON.parse(event.data);
        const message = payload.data;
        const type = message?.type ?? "";
        const messageClientId = message?.clientId ?? "";
        const messageUserId = message?.userId ?? "";

        if (type.startsWith("client.heartbeat")) {
          let pageMembers =
            pageMembersRef.current?.[`${message.roomId}.${message.pageId}`];
          if (
            !pageMembersRef.current?.[`${message.roomId}.${message.pageId}`]
          ) {
            pageMembersRef.current[`${message.roomId}.${message.pageId}`] =
              new Map();
            pageMembers =
              pageMembersRef.current?.[`${message.roomId}.${message.pageId}`];
          }

          pageMembers.set(messageClientId, {
            clientId: messageClientId,
            lastSeen: Date.now(),
          });
        }

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

        if (["roomUpdated"].includes(type)) {
          emitter.emit("roomUpdated", message.payload);
        }

        if (["roomDeleted"].includes(type)) {
          emitter.emit("roomDeleted", message.payload);
        }

        if (["pageCreated"].includes(type)) {
          emitter.emit("pageCreated", message.payload);
        }

        if (["pageUpdated"].includes(type)) {
          emitter.emit("pageUpdated", message.payload);
        }

        if (["pageThumbnailUpdated"].includes(type)) {
          emitter.emit("pageThumbnailUpdated", message.payload);
        }

        if (["pageDeleted"].includes(type)) {
          emitter.emit("pageDeleted", message.payload);
        }

        if (
          ["exportPageToImage"].includes(type) &&
          messageClientId === clientId &&
          messageUserId === session?.user.id
        ) {
          const status = message.status;

          switch (status) {
            case "created": {
              toastExportPageToImageRef.current = toast.loading(
                "Export page to image",
                {
                  description: "Requested",
                  duration: Infinity,
                },
              );
              break;
            }
            case "active": {
              if (toastExportPageToImageRef.current) {
                toastExportPageToImageRef.current = toast.loading(
                  "Export page to image",
                  {
                    id: toastExportPageToImageRef.current,
                    description: "Processing",
                    duration: Infinity,
                  },
                );
              }
              break;
            }
            case "completed": {
              if (toastExportPageToImageRef.current) {
                toast.loading("Export page to image", {
                  id: toastExportPageToImageRef.current,
                  description: "Completed, triggering download",
                  duration: 4000,
                });

                const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
                const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

                const url = `${apiEndpoint}/${hubName}/rooms/${room}/export/${message.data.exportedImageId}?responseType=${message.data.responseType}`;

                const res = await fetch(url);

                if (!res.ok) {
                  setImageExporting(false);
                  toast.error("Export page to image", {
                    id: toastExportPageToImageRef.current,
                    description: "Failed to download image, try again",
                    duration: 4000,
                  });
                  return;
                }

                toast.loading("Export page to image", {
                  id: toastExportPageToImageRef.current,
                  description: "Downloading image, please wait",
                  duration: Infinity,
                });

                const blob = await res.blob();

                toast.dismiss(toastExportPageToImageRef.current);

                const objectUrl = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = objectUrl;
                if (message.data.responseType === "zip") {
                  a.download = "export.zip";
                } else if (message.data.responseType === "blob") {
                  a.download = `export.${message.data.extension}`;
                }
                a.click();

                URL.revokeObjectURL(objectUrl);

                setImageExporting(false);
              }
              toastExportPageToImageRef.current = null;
              break;
            }
            case "failed": {
              if (toastExportPageToImageRef.current) {
                toast.error("Export page to image", {
                  id: toastExportPageToImageRef.current,
                  description: "Failed to export page to image, try again",
                  duration: 4000,
                });

                setImageExporting(false);
              }
              toastExportPageToImageRef.current = null;
              break;
            }
            default:
              break;
          }
        }

        if (
          ["exportRoomToPdf"].includes(type) &&
          messageClientId === clientId &&
          messageUserId === session?.user.id
        ) {
          const status = message.status;

          switch (status) {
            case "created": {
              toastExportRoomToPdfRef.current = toast.loading(
                "Export room to PDF",
                {
                  description: "Requested",
                  duration: Infinity,
                },
              );
              break;
            }
            case "active": {
              if (toastExportRoomToPdfRef.current) {
                toastExportRoomToPdfRef.current = toast.loading(
                  "Export room to PDF",
                  {
                    id: toastExportRoomToPdfRef.current,
                    description: "Processing",
                    duration: Infinity,
                  },
                );
              }
              break;
            }
            case "completed": {
              if (toastExportRoomToPdfRef.current) {
                toast.loading("Export room to PDF", {
                  id: toastExportRoomToPdfRef.current,
                  description: "Completed, triggering download",
                  duration: 4000,
                });

                const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
                const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

                const url = `${apiEndpoint}/${hubName}/rooms/${room}/export/pdf/${message.data.exportedPdfId}?responseType=${message.data.responseType}`;

                const res = await fetch(url);

                if (!res.ok) {
                  setImageExporting(false);
                  toast.error("Export room to PDF", {
                    id: toastExportRoomToPdfRef.current,
                    description: "Failed to download PDF, try again",
                    duration: 4000,
                  });
                  return;
                }

                toast.loading("Export room to PDF", {
                  id: toastExportRoomToPdfRef.current,
                  description: "Downloading PDF, please wait",
                  duration: Infinity,
                });

                const blob = await res.blob();

                toast.dismiss(toastExportRoomToPdfRef.current);

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
              toastExportRoomToPdfRef.current = null;
              break;
            }
            case "failed": {
              if (toastExportRoomToPdfRef.current) {
                toast.error("Export room to PDF", {
                  id: toastExportRoomToPdfRef.current,
                  description: "Failed to export room to PDF, try again",
                  duration: 4000,
                });

                setImageExporting(false);
              }
              toastExportRoomToPdfRef.current = null;
              break;
            }
            default:
              break;
          }
        }

        if (
          ["exportFramesToPdf"].includes(type) &&
          messageClientId === clientId &&
          messageUserId === session?.user.id
        ) {
          const status = message.status;

          switch (status) {
            case "created": {
              toastExportFramesToPdfRef.current = toast.loading(
                "Export frames to PDF",
                {
                  description: "Requested",
                  duration: Infinity,
                },
              );
              break;
            }
            case "active": {
              if (toastExportFramesToPdfRef.current) {
                toastExportFramesToPdfRef.current = toast.loading(
                  "Export frames to PDF",
                  {
                    description: "Processing",
                    id: toastExportFramesToPdfRef.current,
                    duration: Infinity,
                  },
                );
              }
              break;
            }
            case "completed": {
              if (toastExportFramesToPdfRef.current) {
                const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
                const hubName = import.meta.env.VITE_API_ENDPOINT_HUB_NAME;

                const url = `${apiEndpoint}/${hubName}/rooms/${room}/export/pdf/${message.data.exportedPdfId}?responseType=${message.data.responseType}`;

                const res = await fetch(url);

                if (!res.ok) {
                  setFramesExporting(false);
                  toast.error("Export frames to PDF", {
                    id: toastExportFramesToPdfRef.current,
                    description: "Failed to download PDF, try again",
                    duration: 4000,
                  });
                  return;
                }

                toast.loading("Export frames to PDF", {
                  id: toastExportFramesToPdfRef.current,
                  description: "Downloading PDF, please wait",
                  duration: Infinity,
                });

                const blob = await res.blob();

                toast.dismiss(toastExportFramesToPdfRef.current);

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
              toastExportFramesToPdfRef.current = null;
              break;
            }
            case "failed": {
              if (toastExportFramesToPdfRef.current) {
                toast.error("Export frames to PDF", {
                  id: toastExportFramesToPdfRef.current,
                  description: "Failed to export frames to PDF, try again",
                  duration: 4000,
                });

                setFramesExporting(false);
              }
              toastExportFramesToPdfRef.current = null;
              break;
            }
            default:
              break;
          }
        }

        if (
          ["presentationMode"].includes(type) &&
          messageClientId === clientId &&
          messageUserId === session?.user.id
        ) {
          const status = message.status;

          switch (status) {
            case "created": {
              break;
            }
            case "active": {
              setPresentationPagesStatus(message.data?.loadedPages ?? 0);
              break;
            }
            case "completed": {
              const presentationInstance = message.data.presentationModeId;
              setPresentationInstanceId(presentationInstance);
              setPresentationStatus("loaded");
              break;
            }
            case "failed": {
              setPresentationStatus("error");
              break;
            }
            default:
              break;
          }
        }
      };

      ws.onerror = (err) => console.error("❌ [Comm-Bus] error", err);

      ws.onopen = async () => {
        console.log("✅ [Comm-Bus] connected");

        console.log(`🔌 [Comm-Bus] join room <${room}>`);

        await postCommBusJoin(room ?? "", session?.user.id ?? "");

        console.log(`✅ [Comm-Bus] room <${room}> joined`);

        setActualRoomPage(`${room}.${pageId}`);

        setCommBusConnected(true);
      };

      setInitializedCommBus(true);
    }

    connectToRoomCoomBus();
  }, [
    initializedCommBus,
    getCommBusUrl,
    room,
    roomInfo,
    roomInfoLoaded,
    roomInfoError,
    pageId,
    setCommBusConnected,
    queryClient,
    clientId,
    session,
    setPresentationPagesStatus,
    setPresentationInstanceId,
    setPresentationStatus,
    setFramesExporting,
    setImageExporting,
  ]);

  React.useEffect(() => {
    let sendIntervalId = undefined;
    if (commBusConnected) {
      sendIntervalId = setInterval(() => {
        bus?.send(
          JSON.stringify({
            type: "sendToGroup",
            group: `${room ?? ""}.commbus`,
            dataType: "json",
            noEcho: false,
            data: {
              type: "client.heartbeat",
              roomId: room,
              pageId: pageId,
              clientId,
            },
          }),
        );
      }, 2000);
    }

    return () => {
      if (sendIntervalId) {
        clearInterval(sendIntervalId);
      }
    };
  }, [room, pageId, clientId, bus, commBusConnected]);

  React.useEffect(() => {
    if (actualRoomPage !== `${room}.${pageId}`) {
      setLeaderId(null);
      setActualRoomPage(`${room}.${pageId}`);
      pageMembersRef.current[`${room}.${pageId}`] = new Map();
    }
  }, [room, pageId, actualRoomPage, setLeaderId]);

  React.useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      let pageMembers = pageMembersRef.current?.[`${room}.${pageId}`];
      if (!pageMembersRef.current?.[`${room}.${pageId}`]) {
        pageMembersRef.current[`${room}.${pageId}`] = new Map();
        pageMembers = pageMembersRef.current?.[`${room}.${pageId}`];
      }

      cleanupMembers(pageMembers);

      const newLeader = electLeader(pageMembers);

      setLeaderId(newLeader);
    }, 3000);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [room, pageId, setLeaderId]);
};
