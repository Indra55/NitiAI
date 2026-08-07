"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-white p-3 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="relative flex min-h-[760px] flex-col items-center justify-center rounded-md border border-black/20 bg-white px-6 py-20 sm:px-10 dark:border-white/10 dark:bg-[#0a0a0a] lg:min-h-0 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[590px]">
            {children}
          </div>
        </div>

        <div className="relative flex min-h-[720px] overflow-hidden rounded-md bg-black p-8 text-white sm:p-12 lg:min-h-0">
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#FC7819", "#FC7819", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-black"
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            {/* Top Left Logo */}
            <div>
              <Link href="/" className="inline-flex items-center transition-transform hover:scale-105">
                
                <span className="text-white font-bold text-3xl sm:text-4xl lg:text-[42px] tracking-tight">NitiAI</span>
              </Link>
            </div>

            {/* Bottom Right Tagline */}
            <div className="flex justify-end text-right">
              <h2 className="max-w-[620px] text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl lg:text-[56px] lg:leading-[1.05] xl:text-[64px]">
                Navigate your career,
                <br />
                Powered by AI
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
