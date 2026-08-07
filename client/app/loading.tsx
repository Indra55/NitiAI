"use client";

import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-md">
      <Spinner size="xl" />
      <div className="text-orange-500 font-medium">Preparing your career journey...</div>
    </div>
  );
}
