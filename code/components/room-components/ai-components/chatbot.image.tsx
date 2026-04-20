// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { downscaleImageFromURL } from "@inditextech/weave-sdk";
import { Button } from "@/components/ui/button";
import { Ban, Bug, Paperclip } from "lucide-react";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";

type ChatBotImageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
};

function stripOrigin(url: string): string {
  const u = new URL(url);
  return u.pathname + u.search + u.hash;
}

export const ChatBotImage = ({ image }: ChatBotImageProps) => {
  const [downscaledImageDataUrl, setDownscaledImageDataUrl] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    const getDownscaledImage = async () => {
      const dataURL = await downscaleImageFromURL(image.url, {
        maxWidth: 200,
        maxHeight: 200,
      });
      setDownscaledImageDataUrl(dataURL);
    };

    if (image.url) {
      getDownscaledImage();
    }
  }, [image.url]);

  const promptInputAttachmentsController = usePromptInputAttachments();

  if (["prohibited_content"].includes(image.status)) {
    return (
      <div className="max-h-64 w-64 h-64 p-5 font-light text-sm border-[0.5px] border-[#ff2c2c] flex flex-col justify-center items-center text-center gap-2">
        <Ban size={32} strokeWidth={1} className="text-[#ff2c2c]" />
        Prohibited content,
        <br />
        please try again.
      </div>
    );
  }

  if (!["generated"].includes(image.status)) {
    return (
      <div className="max-h-64 w-64 h-64 p-5 font-light text-sm border-[0.5px] border-[#ff2c2c] flex flex-col justify-center items-center text-center gap-2">
        <Bug size={32} strokeWidth={1} className="text-[#ff2c2c]" />
        Failed to generate image,
        <br /> please try again.
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={image.url}
        alt="Generated Image"
        className="max-h-64 object-contain cursor-pointer border border-[#c9c9c9]"
        data-image-id={image.imageId}
        data-image-fallback={downscaledImageDataUrl}
        data-image-url={stripOrigin(image.url)}
      />

      <div className="absolute bottom-[12px] right-[12px]">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-none !cursor-pointer uppercase !text-xs w-[40px]"
          onClick={async () => {
            const blob = await fetch(image.url).then((res) => res.blob());

            const file = new File([blob], "image.png", {
              type: "image/png",
            });

            promptInputAttachmentsController.add([file]);
          }}
        >
          <Paperclip strokeWidth={1} size={20} />
        </Button>
      </div>
    </div>
  );
};
