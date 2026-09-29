"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BRANCHES } from '@/branches';

export const dynamic = "force-dynamic";

export default function BranchSelectorPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 700);
    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] font-sans">
        <style>{`
          @keyframes jumpBar {
            0%, 100% { transform: scaleY(0.4); }
            50% { transform: scaleY(1); }
          }
        `}</style>
        <div className="flex flex-col items-center gap-5">
          <img src="/szk.png" alt="Suzuki" className="h-10 w-auto object-contain opacity-90" />

          {/* Jumping bars */}
          <div className="flex items-end gap-1.5 h-10">
            {[0, 150, 300, 450, 600].map((delay, i) => (
              <span
                key={i}
                className="w-2 h-full bg-[#003399] rounded-full origin-bottom"
                style={{
                  animation: 'jumpBar 0.9s ease-in-out infinite',
                  animationDelay: `${delay}ms`,
                }}
              />
            ))}
          </div>

          <span className="text-slate-400 text-xs font-medium tracking-wide">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f4f7fa] font-sans flex flex-col items-center justify-center px-6"
      style={{ animation: 'fadeIn 0.4s ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <img src="/szk.png" alt="Suzuki Logo" className="h-16 w-auto object-contain mb-6" />
      <h1 className="text-2xl font-black text-slate-800 mb-1">Service Management System</h1>
      <p className="text-sm text-slate-500 mb-8">Select a branch to view its live appointment status</p>

      <div className="grid gap-3 w-full max-w-sm">
        {Object.entries(BRANCHES).map(([slug, info]) => (
          <Link
            key={slug}
            href={`/${slug}`}
            className="flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[#003399] hover:shadow-md transition-all group"
          >
            <span className="font-bold text-slate-800">{info.label}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 group-hover:text-[#003399] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <Link
        href="/login"
        className="mt-10 inline-flex items-center gap-2 px-6 py-3 bg-[#003399] hover:bg-[#0054a6] text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
      >
        Admin Login
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}