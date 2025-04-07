import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weavejs-react";
import { WeaveUser } from "@inditextech/weavejs-types";
import {
  WeaveStoreAzureWebPubsub,
  WeaveStoreAzureWebPubsubConnectionStatus,
} from "@inditextech/weavejs-store-azure-web-pubsub";
import React from "react";

function useGetWsProvider({
  loadedParams,
  getUser,
}: {
  loadedParams: boolean;
  getUser: () => WeaveUser;
}) {
  const room = useCollaborationRoom((state) => state.room);

  const setFetchConnectionUrlLoading = useCollaborationRoom(
    (state) => state.setFetchConnectionUrlLoading
  );

  const setFetchConnectionUrlError = useCollaborationRoom(
    (state) => state.setFetchConnectionUrlError
  );

  const setConnectionStatus = useWeave((state) => state.setConnectionStatus);

  const onFetchConnectionUrlHandler = React.useCallback(
    ({ loading, error }: { loading: boolean; error: Error | null }) => {
      setFetchConnectionUrlLoading(loading);
      setFetchConnectionUrlError(error);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onConnectionStatusChangeHandler = React.useCallback(
    (status: WeaveStoreAzureWebPubsubConnectionStatus) => {
      setConnectionStatus(status);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const wsProvider = React.useMemo(() => {
    if (loadedParams && room) {
      return new WeaveStoreAzureWebPubsub(
        {
          getUser,
          undoManagerOptions: {
            captureTimeout: 500,
          },
        },
        {
          roomId: room,
          url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${room}/connect`,
          callbacks: {
            onFetchConnectionUrl: onFetchConnectionUrlHandler,
            onConnectionStatusChange: onConnectionStatusChangeHandler,
          },
        }
      );
    }

    return null;
  }, [
    getUser,
    loadedParams,
    onConnectionStatusChangeHandler,
    onFetchConnectionUrlHandler,
    room,
  ]);

  return wsProvider;
}

export default useGetWsProvider;
