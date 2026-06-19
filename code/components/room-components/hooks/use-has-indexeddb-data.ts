import React from "react";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";

export const useHasIndexedDBData = (
  roomId: string,
  options: { indexedDB: { enabled: boolean } },
) => {
  const [checkedData, setCheckedData] = React.useState<boolean>(false);
  const [hasData, setHasData] = React.useState<boolean>(false);

  React.useEffect(() => {
    setCheckedData(false);
    setHasData(false);
  }, [roomId]);

  React.useEffect(() => {
    const hasRoomData = async () => {
      const data = await WeaveStoreAzureWebPubsub.roomHasIndexedDbData(roomId);
      setCheckedData(true);
      setHasData(data);
    };

    if (options.indexedDB.enabled && roomId && !checkedData) {
      hasRoomData();
    }
    if (!options.indexedDB.enabled && roomId && !checkedData) {
      setCheckedData(true);
      setHasData(false);
    }
  }, [options.indexedDB.enabled, checkedData, roomId]);

  return { checkedData, hasData };
};
