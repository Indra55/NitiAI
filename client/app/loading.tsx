"use client";

import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <OrbitalLoader message="Preparing your career journey..." />
    </div>
  );
}
