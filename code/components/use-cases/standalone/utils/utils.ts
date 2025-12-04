import * as Y from "yjs";

export function uint8ToBase64(uint8: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isArray = (val: any): boolean => {
  return Array.isArray(val);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (val: any): boolean => {
  return val !== null && typeof val === "object" && !Array.isArray(val);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapJsonToYjsMap = (jsonData: any) => {
  const map = new Y.Map();
  const keys = Object.keys(jsonData);
  for (const key of keys) {
    const value = jsonData[key];
    if (isArray(value)) {
      map.set(key, mapJsonToYjsArray(value));
    } else if (isObject(value)) {
      map.set(key, mapJsonToYjsMap(value));
    } else {
      map.set(key, value);
    }
  }
  return map;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapJsonToYjsArray = (jsonData: any) => {
  const array = new Y.Array();
  for (const item of jsonData) {
    if (isArray(item)) {
      array.push([mapJsonToYjsArray(item)]);
    } else if (isObject(item)) {
      array.push([mapJsonToYjsMap(item)]);
    } else {
      array.push(item);
    }
  }
  return array;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapJsonToYjsElements = (jsonData: any) => {
  if (isArray(jsonData)) {
    return mapJsonToYjsArray(jsonData);
  } else if (isObject(jsonData)) {
    return mapJsonToYjsMap(jsonData);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const weavejsToYDoc = (weavejsData: any) => {
  const doc = new Y.Doc();

  doc.getMap("weave").set("key", weavejsData.weave.key);
  doc.getMap("weave").set("type", weavejsData.weave.type);
  doc
    .getMap("weave")
    .set("props", mapJsonToYjsElements(weavejsData.weave.props));

  const actualState = Y.encodeStateAsUpdate(doc);

  return actualState;
};

export const initStandaloneInstanceImage = ({
  instanceId,
  imageId,
  width,
  height,
}: {
  instanceId: string;
  imageId: string;
  width: number;
  height: number;
}) => {
  const model = {
    weave: {
      key: "stage",
      type: "stage",
      props: {
        id: "stage",
        children: [
          {
            key: "gridLayer",
            type: "layer",
            props: {
              id: "gridLayer",
              nodeType: "layer",
              children: [],
            },
          },
          {
            key: "mainLayer",
            type: "layer",
            props: {
              id: "mainLayer",
              nodeType: "layer",
              children: [
                {
                  key: imageId,
                  type: "image",
                  props: {
                    id: imageId,
                    nodeType: "image",
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    rotation: 0,
                    imageInfo: {
                      width,
                      height,
                    },
                    locked: true,
                    imageWidth: width,
                    imageHeight: height,
                    imageURL: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/standalone/${instanceId}/images/${imageId}`,
                  },
                },
              ],
            },
          },
          {
            key: "selectionLayer",
            type: "layer",
            props: {
              id: "selectionLayer",
              nodeType: "layer",
              children: [],
            },
          },
          {
            key: "usersPointersLayer",
            type: "layer",
            props: {
              id: "usersPointersLayer",
              nodeType: "layer",
              children: [],
            },
          },
          {
            key: "utilityLayer",
            type: "layer",
            props: {
              id: "utilityLayer",
              nodeType: "layer",
              children: [],
            },
          },
        ],
      },
    },
  };

  const actualState = weavejsToYDoc(model);

  return uint8ToBase64(actualState);
};
