"use client";

import React from "react";
import { useMounted } from "@/components/room-components/hooks/use-mounted";

export function NoSsr({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return <>{children}</>;
}
