"use client"

import { motion } from "motion/react"
import { Mic, FileText, ArrowRight } from "lucide-react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { useRouter } from "next/navigation"

export default function ResumeArenaPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <DynamicNavbar />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-32 pb-16 px-6">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Resume Arena.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
              Select your approach. Build it seamlessly through conversational AI, or craft it manually with our classic editorial toolkit.
            </p>
          </motion.div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          
          {/* Card 1: Voice Resume */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group cursor-pointer"
            onClick={() => router.push("/voice-resume")}
          >
            <div className="h-full bg-white border border-gray-200 p-10 transition-all duration-300 hover:border-gray-900 hover:shadow-xl flex flex-col rounded-2xl">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-8 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                <Mic className="w-5 h-5 text-gray-900 group-hover:text-white transition-colors duration-300" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Voice Resume</h2>
              
              <p className="text-gray-500 mb-10 flex-1 leading-relaxed text-sm md:text-base">
                An intelligent, hands-free experience. Dictate your work history naturally in any Indian language, and let our AI recruiter instantly structure it into a professional document.
              </p>
              
              <div className="flex items-center text-gray-900 font-medium text-sm gap-2 mt-auto group-hover:gap-3 transition-all duration-300">
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
            <div className="h-full bg-white border border-gray-200 p-10 transition-all duration-300 hover:border-gray-900 hover:shadow-xl flex flex-col rounded-2xl">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-8 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                <FileText className="w-5 h-5 text-gray-900 group-hover:text-white transition-colors duration-300" />
              </div>
              
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
