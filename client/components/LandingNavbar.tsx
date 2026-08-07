import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const LandingNavbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center justify-center">
          <Image src="/nitiai.png" alt="Niti AI" width={40} height={40} className="object-contain w-10 h-10" />
        </div>
        <span className="text-gray-900 font-bold text-xl tracking-tight">NitiAI</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="#toolkit" className="hover:text-gray-900 transition-colors flex items-center gap-1">
          Toolkit
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
        <Link href="#plans" className="hover:text-gray-900 transition-colors">Plans</Link>
      </div>

      <div className="flex items-center">
        <Link 
          href="/auth" 
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};
