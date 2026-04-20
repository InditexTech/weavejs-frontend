// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { motion } from "framer-motion";
import ScrollVelocity from "@/components/ui/reactbits/TextAnimations/ScrollVelocity/ScrollVelocity";

const containerVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    transition: {
      duration: 0.5,
    },
  },
  visible: {
    opacity: 1,
    filter: "blur(0)",
    transition: {
      duration: 0.5,
    },
  },
};

export function RoomAnimation() {
  return (
    <motion.div
      id="room-loader-animation"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className="fade absolute top-0 left-0 right-0 bottom-0 bg-white flex justify-center items-center overflow-hidden z-100"
    >
      <div className="absolute top-0 left-[-100px] right-[-100px] bottom-0 flex justify-center items-center">
        <ScrollVelocity
          texts={[
            "collaborative - easy to use - extensible - visual - open source -",
            "this is weave.js - this is weave.js - this is weave.js - this is weave.js -",
            "intuitive - free - html5 canvas - real time - powerful -",
          ]}
          velocity={150}
          numCopies={20}
          className="text-5xl font-inter font-light text-zinc-500/25"
        />
      </div>
    </motion.div>
  );
}
