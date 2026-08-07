"use client";

import React from "react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah Jenkins",
    handle: "@sarah_codes",
    text: "The career recommendations were spot on. The AI actually understood my unique skill set instead of just giving generic advice.",
    img: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  {
    name: "Michael Torres",
    handle: "@mtorres_dev",
    text: "I finally feel like I have a structured path. The interview prep feature is an absolute game-changer!",
    img: "https://i.pravatar.cc/150?u=a04258a2462d826712d"
  },
  {
    name: "Elena Rodriguez",
    handle: "@elena_builds",
    text: "NitiAI helped me identify my skill gaps perfectly. I followed the roadmap and landed a Senior Dev role in 3 months.",
    img: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
  },
  {
    name: "David Kim",
    handle: "@davidk_tech",
    text: "The ATS-optimized resume builder got me past the screeners at top companies where I used to just get auto-rejected.",
    img: "https://i.pravatar.cc/150?u=a04258114e29026702d"
  },
  {
    name: "Anita Patel",
    handle: "@anita_product",
    text: "Unbelievably personalized. It genuinely feels like having a senior mentor guiding every step of my career.",
    img: "https://i.pravatar.cc/150?u=a048581f4e29026701d"
  },
  {
    name: "Chris Martinez",
    handle: "@chrism_ux",
    text: "I transitioned from marketing to product management seamlessly thanks to the incredibly detailed skill breakdown.",
    img: "https://i.pravatar.cc/150?u=a042581f4e29026703d"
  },
  {
    name: "Jordan Lee",
    handle: "@jordanl_dev",
    text: "The peer learning groups are fantastic. I prepped with people aiming for the exact same roles as me.",
    img: "https://i.pravatar.cc/150?u=a042581f4e29026705d"
  },
  {
    name: "Taylor Wilson",
    handle: "@taylorw_eng",
    text: "A must-have for anyone serious about their career growth. The market insights for 2026 are incredibly sharp.",
    img: "https://i.pravatar.cc/150?u=a042581f4e29026708d"
  }
];

const ReviewCard = ({ img, name, handle, text }: { img: string; name: string; handle: string; text: string }) => {
  return (
    <div
      className={cn(
        "relative w-72 shrink-0 cursor-pointer overflow-hidden rounded-xl border p-5",
        "border-zinc-800 bg-[#09090b] hover:bg-zinc-900/80 transition-colors duration-300"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img className="rounded-full w-10 h-10 object-cover border border-zinc-800" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-zinc-500">{handle}</p>
        </div>
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed text-zinc-300">
        "{text}"
      </blockquote>
    </div>
  );
};

export function TestimonialMarquee() {
  // Split testimonials into two rows
  const firstRow = testimonials.slice(0, testimonials.length / 2);
  const secondRow = testimonials.slice(testimonials.length / 2);

  return (
    <section className="w-full bg-black py-24 relative overflow-hidden flex flex-col items-center justify-center">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); } /* 12px is half the gap (24px) */
        }
        @keyframes scroll-right {
          0% { transform: translateX(calc(-50% - 12px)); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        /* Pause on hover */
        .marquee-container:hover .animate-scroll-left,
        .marquee-container:hover .animate-scroll-right {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="max-w-xl mx-auto text-center mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
          Trusted by thousands of <span className="text-orange-500">professionals</span>
        </h2>
        <p className="text-zinc-400 text-lg">
          See how NitiAI is helping people land their dream roles.
        </p>
      </div>

      <div className="relative w-full max-w-[1600px] flex flex-col gap-6 marquee-container">
        {/* Row 1: Marquees Right */}
        <div className="flex overflow-hidden w-full">
          <div className="flex shrink-0 gap-6 animate-scroll-right w-max">
            {[...firstRow, ...firstRow, ...firstRow].map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </div>
        </div>

        {/* Row 2: Marquees Left */}
        <div className="flex overflow-hidden w-full">
          <div className="flex shrink-0 gap-6 animate-scroll-left w-max">
            {[...secondRow, ...secondRow, ...secondRow].map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          </div>
        </div>

        {/* Edge Fade Gradients for the marquee effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 max-w-[250px] bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 max-w-[250px] bg-gradient-to-l from-black to-transparent" />
      </div>
    </section>
  );
}
