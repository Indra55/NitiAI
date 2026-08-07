"use client";

import React from "react";
import { motion } from "framer-motion";

export function PhilosophySection() {
  const bgImageUrl =
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1144&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[600px] flex flex-col justify-end font-sans overflow-hidden">
      {/* Background Image covering the entire section */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url('${bgImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />
      
      {/* Dark overlay to ensure baseline readability */}
      <div className="absolute inset-0 z-0 bg-black/20" />
      
      {/* Top fade to blend seamlessly with the section above */}
      <div className="absolute inset-x-0 top-0 h-48 md:h-64 z-0 bg-gradient-to-b from-background via-background/80 to-transparent" />
      
      {/* Bottom fade for text readability - reduced to let image shine through */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content Section Overlay */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-24 pt-32">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col mb-10"
          >
            <p className="text-white/50 text-[10px] md:text-xs tracking-[0.25em] uppercase font-semibold mb-4">
              Our Philosophy
            </p>
            <p className="text-[#a1a1aa] text-sm md:text-base max-w-sm leading-relaxed">
              Career planning, insights, <br className="hidden md:block" />
              and paths built to last
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] xl:text-[68px] tracking-tight text-[#f4f4f5] leading-[1.05] max-w-[800px]">
              AI-led guidance for people who <span className="text-orange-500">care</span> where their career leads.
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <div className="text-[#a1a1aa] text-sm md:text-base max-w-[600px] leading-relaxed">
              <p>
                From first resume to final interview, we shape professional journeys that balance ambition, skill, and daily life. Thoughtful planning, refined insights, and a calm growth process.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
