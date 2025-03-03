import { Error } from "@/components/error/error";
import { Suspense } from "react";

export default function RoomPage() {
  return (
    <Suspense>
      <Error />
    </Suspense>
  );
}
