import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Twitter, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-background px-4 md:px-6 lg:px-8 pb-8 pt-12 relative z-10">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Brand Panel */}
        <div className="relative w-full lg:w-1/3 min-h-[400px] lg:min-h-[500px] bg-primary rounded-[2rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-xl">
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
          
          <div className="relative z-10 flex items-center">
             <div className="shrink-0 flex items-center justify-center">
               <Image src="/nitiai.png" alt="Niti AI" width={40} height={40} className="object-contain w-10 h-10" />
             </div>
             <span className="text-white font-bold text-xl tracking-tight">NitiAI</span>
          </div>

          <div className="relative z-10 mt-auto pt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-8 leading-tight">
              Build your <br /> career journey
            </h2>
            
            <div className="flex items-center gap-4 text-white/90 mb-8">
              <Link href="#" className="hover:text-white hover:scale-110 transition-transform"><Twitter className="w-5 h-5 fill-current" /></Link>
              <Link href="#" className="hover:text-white hover:scale-110 transition-transform"><Linkedin className="w-5 h-5 fill-current" /></Link>
              <Link href="#" className="hover:text-white hover:scale-110 transition-transform"><Facebook className="w-5 h-5 fill-current" /></Link>
              <Link href="#" className="hover:text-white hover:scale-110 transition-transform"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-white hover:scale-110 transition-transform"><Youtube className="w-5 h-5" /></Link>
            </div>
            
            <p className="text-white/70 text-xs">
              © {new Date().getFullYear()} NitiAI, All rights reserved
            </p>
          </div>
        </div>

        {/* Right Side: Links & Newsletter */}
        <div className="w-full lg:w-2/3 bg-[#0a0a0c] border border-zinc-800/80 rounded-[2rem] p-8 md:p-12 lg:p-16 flex flex-col justify-between shadow-2xl">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-16">
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-white text-base mb-2">Product</h3>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Solutions</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Customers</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Help</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Terms</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-white text-base mb-2">Resources</h3>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Help</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Tutorials</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">API Reference</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Status</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Docs</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Templates</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-white text-base mb-2">Company</h3>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">About</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Team</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Press</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Contact</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Privacy</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-white text-base mb-2">Socials</h3>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">X</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">LinkedIn</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Facebook</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Threads</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Instagram</Link>
              <Link href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Youtube</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm mt-auto">
            <h3 className="font-bold text-white text-lg tracking-tight">Newsletter</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                type="email" 
                placeholder="Enter Your Email" 
                className="bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-primary h-12 rounded-xl"
              />
              <Button className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold shrink-0">
                Submit
              </Button>
            </div>
          </div>
          
        </div>
        
      </div>
    </footer>
  );
}
