"use client";

import { motion } from "framer-motion";
import Threads from "@/components/ui/reactbits/Backgrounds/Threads/Threads";
import { Logo } from "@/components/utils/logo";

type RoomLoaderProps = {
  roomId?: string;
  content: string;
  description?: string;
};

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] };
const variants = {
  hidden: { filter: "blur(10px)", transform: "translateY(20%)", opacity: 0 },
  visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
};

export function RoomLoader({
  roomId,
  content,
  description,
}: Readonly<RoomLoaderProps>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      transition={{ staggerChildren: .3 }}
      className="w-full h-full bg-white flex justify-center items-center relative overflow-hidden"
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-full"
        transition={transition}
        variants={variants}
      >
        <Threads
          color={[246 / 255, 246 / 255, 246 / 255]}
          amplitude={1}
          distance={0}
          enableMouseInteraction={false}
        />
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-full flex justify-center items-center">
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <motion.div transition={transition} variants={variants}>
            <Logo kind="large" variant="no-text" />
          </motion.div>
          <div className="flex flex-col justify-center items-center text-black gap-3">
            <div className="font-noto-sans font-extralight text-2xl uppercase">
              <motion.span transition={transition} variants={variants}>
                {content}
              </motion.span>
            </div>
            {roomId && (
              <div className="font-noto-sans text-2xl font-semibold">
                <motion.span transition={transition} variants={variants}>
                  {roomId}
                </motion.span>
              </div>
            )}
            {description && (
              <div className="font-noto-sans-mono text-xl" >
                <motion.span
                  transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                  variants={variants}
                  key={description}
                >
                  {description}
                </motion.span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
