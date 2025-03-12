"use client";

import { motion } from "framer-motion";
import { Logo } from "../utils/logo";

type RoomLoaderProps = {
  roomId?: string;
  content: string;
  description?: string;
};

export function RoomLoader({
  roomId,
  content,
  description,
}: Readonly<RoomLoaderProps>) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <Logo kind="large" variant="no-text" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col justify-center items-center text-black"
      >
        <div className="font-noto-sans font-extralight text-2xl uppercase">
          {content}
        </div>
        {roomId && <div className="font-noto-sans text-4xl">{roomId}</div>}
        {description && (
          <div className="font-noto-sans-mono text-xl mt-8">{description}</div>
        )}
      </motion.div>
    </div>
  );
}
