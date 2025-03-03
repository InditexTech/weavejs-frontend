"use client";

import React from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCollaborationRoom } from "@/store/store";
import { Logo } from "@/components/utils/logo";
import { HomeShowCaseAnimation } from "../home-components/home-showcase-animation";
import LoginForm from "../home-components/login-form";

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "The username must contain at least 2 characters" })
    .max(50, { message: "The username must contain as maximum 50 characters" }),
  roomId: z
    .string()
    .min(5, { message: "The room id must contain at least 5 characters" })
    .max(50, { message: "The room id must contain as maximum 50 characters" }),
});

export const Home = () => {
  return (
    <main className="w-full h-full grid grid-cols-[1fr_1fr]">
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex h-full w-full flex-col items-center justify-center p-6"
      >
        <div className="absolute left-6 top-6 flex flex-col gap-2 md:left-8 md:top-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-start justify-start bg-background"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground">COLLABORATION TOOL</h1>
            <h2 className="text-xl text-muted-foreground">SHOWCASE</h2>
          </motion.div>
        </div>
       <LoginForm />
        <div className="absolute bottom-8 left-8 flex flex-col gap-5 justify-center items-center">
          <div className="p-0 bg-light-background-1 flex justify-start items-center gap-2">
            <Logo />
          </div>
        </div>
      </motion.section>
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative hidden items-center justify-center bg-muted lg:flex"
      >
        <HomeShowCaseAnimation />
      </motion.aside>
    </main>
  );
};
