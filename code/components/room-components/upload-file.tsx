import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { useMutation } from "@tanstack/react-query";
import { postImage } from "@/api/post-image";

export function UploadFile() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputFileRef = React.useRef<any>(null);

  const room = useCollaborationRoom((state) => state.room);
  const showSelectFile = useCollaborationRoom(
    (state) => state.images.showSelectFile
  );
  const setUploadingImage = useCollaborationRoom(
    (state) => state.setUploadingImage
  );
  const finishUploadCallback = useCollaborationRoom(
    (state) => state.images.finishUploadCallback
  );
  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );

  const mutationUpload = useMutation({
    mutationFn: async (file: File) => {
      return await postImage(room ?? "", file);
    },
  });

  React.useEffect(() => {
    if (showSelectFile && inputFileRef.current) {
      inputFileRef.current.click();
      setShowSelectFileImage(false);
    }
  }, [showSelectFile, setShowSelectFileImage]);

  return (
    <input
      type="file"
      accept="image/png,image/gif,image/jpeg"
      name="image"
      ref={inputFileRef}
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setUploadingImage(true);
          mutationUpload.mutate(file, {
            onSuccess: (data) => {
              inputFileRef.current.value = null;
              const room = data.fileName.split("/")[0];
              const imageId = data.fileName.split("/")[1];

              finishUploadCallback?.(
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
              );
            },
            onError: () => {
              console.error("Error uploading image");
            },
            onSettled: () => {
              setUploadingImage(false);
            },
          });
        }
      }}
    />
  );
}
