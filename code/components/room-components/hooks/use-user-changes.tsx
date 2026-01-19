import React from "react";
import { useWeave } from "@inditextech/weave-react";
import {
  WeaveNodeChangeType,
  WeaveStateElement,
  WeaveUser,
} from "@inditextech/weave-types";

export const useUserChanges = () => {
  const instance = useWeave((state) => state.instance);

  React.useEffect(() => {
    const handleOnUserChange = (event: {
      user: WeaveUser;
      changeType: WeaveNodeChangeType;
      node: WeaveStateElement;
      parent: WeaveStateElement;
    }) => {
      console.log(`[${event.changeType}] USER CHANGE`, {
        user: event.user,
        node: event.node,
        parent: event.parent,
      });
    };

    instance?.addEventListener("onUserChange", handleOnUserChange);

    return () => {
      instance?.removeEventListener("onUserChange", handleOnUserChange);
    };
  }, [instance]);
};
