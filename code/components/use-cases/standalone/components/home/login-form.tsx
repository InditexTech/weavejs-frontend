// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import * as changeCase from "change-case";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStandaloneUseCase } from "../../store/store";

const formSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, { message: "The username is required" })
      .max(50, { message: "The username must be maximum 50 characters long" }),
    roomId: z
      .string()
      .trim()
      .min(1, { message: "The room name is required" })
      .max(50, { message: "The room name must be maximum 50 characters long" }),
  })
  .required();

function LoginForm() {
  const roomRef = React.useRef<HTMLInputElement>(null);

  const router = useRouter();

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const setInstanceId = useStandaloneUseCase((state) => state.setInstanceId);
  const setUser = useStandaloneUseCase((state) => state.setUser);

  React.useEffect(() => {
    roomRef.current?.focus();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      username: "",
      roomId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const roomIdMapped = changeCase.kebabCase(values.roomId);
    const userMapped = {
      id: `${values.username}-${uuidv4()}`,
      name: values.username,
      email: `${values.username}@weavejs.com`,
    };
    setInstanceId(roomIdMapped);
    setUser(userMapped);
    sessionStorage.setItem(
      `weave.js_standalone_${instanceId}`,
      JSON.stringify(userMapped)
    );
    router.push(`/use-cases/standalone/${roomIdMapped}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full flex justify-center items-start"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-5"
        >
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#757575] text-sm font-inter font-light">
                  Room name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    ref={roomRef}
                    placeholder="room name to join"
                    className="font-inter font-light rounded-none border-black"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="mb-0">
                <FormLabel className="text-[#757575] text-sm font-inter font-light">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="your username"
                    className="font-inter font-light rounded-none border-black"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center items-center">
            <Button
              type="submit"
              className="cursor-pointer font-inter rounded-none mt-[32px] w-full"
            >
              ENTER
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}

export default LoginForm;
