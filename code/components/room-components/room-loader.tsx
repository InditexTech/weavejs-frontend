"use client"

import { motion } from "framer-motion"
import { Logo } from "../utils/logo"

export function RoomLoader() {
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
      <Logo kind="large" variant="no-text"/>
    </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        >
        <p className="text-lg font-semibold text-primary animate-pulse">Loading your Collaborative Room...</p>
      </motion.div>
    </div>
  )
}

