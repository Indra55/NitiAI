"use client"

import { motion } from "motion/react"
import { Mic, FileText, ArrowRight } from "lucide-react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { useRouter } from "next/navigation"

export default function ResumeArenaPage() {
  const router = useRouter()

  return (
    <div className="dashboard-theme min-h-screen bg-[#fcf9f5] text-gray-900 flex flex-col font-sans">
      <DynamicNavbar />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16 pt-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <p className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-[#79736c]"><span className="size-2 rounded-full bg-[#ef4a18]" /> Choose your resume experience</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Resume Arena.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
              Select your approach. Build it seamlessly through conversational AI, or craft it manually with our classic editorial toolkit.
            </p>
          </motion.div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          
          {/* Card 1: Voice Resume */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group cursor-pointer"
            onClick={() => router.push("/voice-resume")}
          >
            <div className="h-full overflow-hidden bg-[#1b1b1a] p-9 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(42,27,20,.18)] flex flex-col rounded-[26px] text-white relative">
              <div className="absolute -right-10 -top-10 size-40 rounded-full border-[18px] border-[#ef4a18]" />
              <div className="relative z-10 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                <Mic className="w-5 h-5 text-[#ff8a65]" />
              </div>
              
              <span className="relative z-10 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 mb-4">Speak naturally</span>
              <h2 className="relative z-10 text-2xl font-semibold text-white mb-4 tracking-tight">Voice Resume</h2>
              
              <p className="relative z-10 text-white/65 mb-10 flex-1 leading-relaxed text-sm md:text-base">
                An intelligent, hands-free experience. Dictate your work history naturally in any Indian language, and let our AI recruiter instantly structure it into a professional document.
              </p>
              
              <div className="relative z-10 flex items-center text-white font-medium text-sm gap-2 mt-auto group-hover:gap-3 transition-all duration-300">
                Start Session <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Classic Builder */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="group cursor-pointer"
            onClick={() => router.push("/resume-builder")}
          >
            <div className="h-full bg-white border border-[#e8e1da] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-[#ef4a18]/40 hover:shadow-[0_20px_44px_rgba(42,27,20,.12)] flex flex-col rounded-[26px]">
              <div className="w-12 h-12 bg-[#fff0eb] rounded-2xl flex items-center justify-center mb-8">
                <FileText className="w-5 h-5 text-[#ef4a18]" />
              </div>
              
              <span className="w-fit rounded-full bg-[#f4f1ed] px-3 py-1 text-xs font-medium text-[#746e67] mb-4">Edit with precision</span>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Classic Builder</h2>
              
              <p className="text-gray-500 mb-10 flex-1 leading-relaxed text-sm md:text-base">
                Our powerful, traditional editorial toolkit. Dive deep into customization with ATS-friendly templates and AI-assisted rewriting for fine-grained control over every detail.
              </p>
              
              <div className="flex items-center text-gray-900 font-medium text-sm gap-2 mt-auto group-hover:gap-3 transition-all duration-300">
                Open Editor <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
