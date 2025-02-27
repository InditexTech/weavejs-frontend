"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import imageSrc from "@/assets/images/home.png";
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
import { useCollaborationRoom } from "@/store/store";
import { Logo } from "@/components/utils/logo";

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
  const router = useRouter();

  const setRoom = useCollaborationRoom((state) => state.setRoom);
  const setUser = useCollaborationRoom((state) => state.setUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      roomId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setRoom(values.roomId);
    setUser({
      name: values.username,
      email: `${values.username}@weavejs.com`,
    });
    router.push(`/room/${values.roomId}?userName=${values.username}`);
  }

  return (
    <main className="w-full h-full grid grid-cols-[1fr_1fr]">
      <section className="relative w-full h-full flex flex-col justify-center items-center">
        <div className="absolute top-8 left-8 flex flex-col gap-5 justify-start items-center">
          <div className="p-0 bg-white flex flex-col justify-start items-start">
            <h1 className="font-noto-sans text-3xl text-zinc">
              COLLABORATION TOOL
            </h1>
            <h2 className="font-noto-sans-mono text-2xl text-zinc-500">
              SHOWCASE
            </h2>
          </div>
        </div>
        <div className="w-[320px] flex flex-col border-0 border-light-border-3 p-5 gap-5">
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
                    <FormLabel>Room Id</FormLabel>
                    <FormControl>
                      <Input placeholder="i.e.: test-room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="i.e.: myname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                ENTER
              </Button>
            </form>
          </Form>
        </div>
        <div className="absolute bottom-8 left-8 flex flex-col gap-5 justify-center items-center">
          <div className="p-0 bg-light-background-1 flex justify-start items-center gap-2">
            <Logo />
          </div>
        </div>
      </section>
      <aside className="relative w-full h-full flex justify-center items-center bg-light-background-inverse">
        <Image
          src={imageSrc}
          width={2048}
          height={2048}
          priority
          className="w-full h-full object-cover"
          alt="Weave.js logo"
        />
      </aside>
    </main>
  );
};
