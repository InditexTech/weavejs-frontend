"use client";

import React from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Users } from "lucide-react";
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

function LoginForm() {
  const router = useRouter();

  const setRoom = useCollaborationRoom((state) => state.setRoom);
  const setUser = useCollaborationRoom((state) => state.setUser);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      roomId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setRoom(values.roomId);
    setUser({
      name: values.username,
      email: `${values.username}@weavejs.com`,
    });
    router.push(`/room/${values.roomId}?userName=${values.username}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-lg"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Join a Room</h2>
        <p className="text-sm text-muted-foreground">
          Enter your details to start collaborating
        </p>
      </div>
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
                <FormLabel>Room ID</FormLabel>
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
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Join
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}

export default LoginForm;