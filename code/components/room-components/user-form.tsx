// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "motion/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCollaborationRoom } from "@/store/store";

const formSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, { message: "The username is required" })
      .max(50, { message: "The username must be maximum 50 characters long" }),
  })
  .required();

function UserForm() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const room = useCollaborationRoom((state) => state.room);
  const setUser = useCollaborationRoom((state) => state.setUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const userMapped = {
      id: `${values.username}-${uuidv4()}`,
      name: values.username,
      email: `${values.username}@weavejs.com`,
    };
    setUser(userMapped);
    sessionStorage.setItem(`weave.js_${room}`, JSON.stringify(userMapped));
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    ref={inputRef}
                    type="text"
                    placeholder="username"
                    className="font-inter font-light rounded-none text-black border-black w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center items-center">
            <Button
              type="submit"
              className="cursor-pointer font-inter font-light rounded-none w-full mt-6"
            >
              ENTER
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}

export default UserForm;
