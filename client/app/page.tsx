"use client"

import React from 'react';
import { LandingNavbar as Navbar } from '@/components/LandingNavbar';
import { DashboardMockup } from '@/components/DashboardMockup';
import { ArrowUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Hero10 } from '@/components/ui/hero-10';
import { PhilosophySection } from '@/components/PhilosophySection';
import { TestimonialMarquee } from '@/components/TestimonialMarquee';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="w-full min-h-screen overflow-y-auto overflow-x-hidden bg-background font-sans">

      {/* Hero Section (Exactly as provided) */}
      <div
        className="relative min-h-[100svh] overflow-hidden bg-cover bg-center flex flex-col font-sans"
        style={{ backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85')` }}
      >
        <Navbar />

        {/* Spacer between nav and content */}
        <div className="flex-1 min-h-8 sm:min-h-12 lg:min-h-16 shrink-0" />

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center text-center px-5 shrink-0 relative z-20">

          <h1 className="text-gray-900 font-normal leading-[1.05] tracking-tight text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px] flex flex-col items-center">
            <span className="animate-in fade-in slide-in-from-bottom-4 duration-1000 block">
              Get <span className="text-primary">Hired.</span>
            </span>
            <span className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 block">Effortlessly.</span>
          </h1>

          <form className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 mt-5 sm:mt-6 w-full max-w-xl">
            <div className="flex items-center gap-3 rounded-full bg-white/60 backdrop-blur-md ring-1 ring-gray-200 pl-5 pr-1.5 py-1.5 shadow-sm">
              <input
                type="text"
                placeholder="What role are you aiming for? e.g., Senior Product Manager"
                className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 outline-none py-2"
              />
              <button
                type="submit"
                className="px-5 h-9 sm:h-10 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm sm:text-base hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center justify-center"
              >
                Start Planning
              </button>
            </div>
          </form>

          <p className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
            Tailor resumes that answer actual recruiter expectations <br className="hidden sm:block" />
            — and be seen on <Sparkles className="inline w-4 h-4 -mt-1 text-gray-800" /> ATS Platforms.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3 mb-8">
            <Link
              href="/auth"
              className="bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-800 hover:shadow-lg transition-all"
            >
              Try It Free
            </Link>
            <Link
              href="/features"
              className="text-gray-700 text-sm font-medium px-6 py-2.5 rounded-full ring-1 ring-gray-300 hover:bg-gray-100 transition-colors bg-white/50 backdrop-blur-sm"
            >
              Explore Features
            </Link>
          </div>

        </div>

        {/* Spacer between content and dashboard */}
        <div className="flex-1 min-h-10 sm:min-h-12 lg:min-h-16 shrink-0" />

        {/* Dashboard Mockup Component */}
        <DashboardMockup />

        {/* Smooth Gradient Transition to Dark Background */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-full h-64 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* New Unified Feature Section using Hero10 */}
      <div className="relative z-40 bg-background text-foreground flex flex-col w-full pb-32 pt-20">

        <Hero10
          title="Everything you need for"
          titleHighlight="career success"
          description="Access all our powerful tools and features to accelerate your career growth, beautifully presented in a single platform."
          socialProof="Join thousands of successful professionals"
          animation="subtle"
          primaryCTA={{ ctaEnabled: true, text: 'Get Started Free', link: '/auth', variant: 'default' }}
          secondaryCTA={{ ctaEnabled: true, text: 'View Toolkit', link: '#toolkit', variant: 'outline' }}
          features={[
            {
              title: "Career Planner",
              description: "AI analyzes your skills to recommend tailored roadmaps.",
              icon: <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mx-auto" style={{ backgroundImage: "url('/avatars.png')", backgroundSize: "400%", backgroundPosition: "0% 0%", imageRendering: "pixelated" }} />
            },
            {
              title: "Smart Resume",
              description: "Build ATS-optimized resumes that rank instantly.",
              icon: <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mx-auto" style={{ backgroundImage: "url('/avatars.png')", backgroundSize: "400%", backgroundPosition: "33.33% 0%", imageRendering: "pixelated" }} />
            },
            {
              title: "Mock Interviews",
              description: "Realistic AI interviews with real-time behavioral feedback.",
              icon: <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mx-auto" style={{ backgroundImage: "url('/avatars.png')", backgroundSize: "400%", backgroundPosition: "66.66% 33.33%", imageRendering: "pixelated" }} />
            },
            {
              title: "Skill Analysis",
              description: "Identify missing skills and curate your learning path.",
              icon: <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mx-auto" style={{ backgroundImage: "url('/avatars.png')", backgroundSize: "400%", backgroundPosition: "100% 66.66%", imageRendering: "pixelated" }} />
            },
            {
              title: "Peer Learning",
              description: "Join study groups and prepare with ambitious peers.",
              icon: <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl mx-auto" style={{ backgroundImage: "url('/avatars.png')", backgroundSize: "400%", backgroundPosition: "33.33% 100%", imageRendering: "pixelated" }} />
            }
          ]}
        />

      </div>

      {/* Philosophy Section */}
      <PhilosophySection />

      {/* Testimonials Section */}
      <TestimonialMarquee />

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
