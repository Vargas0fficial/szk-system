"use client";

import { useState } from 'react';
import Link from 'next/link';

// Shared "not yet accessible" screen — used by both the public TV display
// ([branch]/page.js) and the admin panel (admin/page.js) when a branch
// hasn't been activated yet.
export default function NotYetAccessible({ branchLabel }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-sans relative overflow-hidden flex flex-col">

      {/* Background artwork */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/abstract-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* NAV */}
      <nav className="relative z-10 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/szk.png" alt="Suzuki" className="h-12 w-auto object-contain" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">
              Way of Life
            </span>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#003399] hover:text-[#0054a6] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2 2-2.5 3.5M12 16.5h.01" />
            </svg>
            Need Help?
          </button>
        </div>
      </nav>

      {/* CENTER CARD */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden grid md:grid-cols-2">

          {/* Illustration panel */}
          <div className="bg-white flex items-center justify-center p-6 border-r border-slate-100">
            <img
              src="/developer-illustration.png"
              alt="Developer working"
              className="w-full max-w-[260px] h-auto object-contain"
            />
          </div>

          {/* Content panel */}
          <div className="p-10 flex flex-col justify-center">
            <img src="/szk-1.png" alt="Suzuki Logo" className="h-10 w-auto object-contain mb-6" />

            <h1 className="text-2xl font-black text-slate-900 leading-tight mb-3">
              This page is not yet accessible.
            </h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {branchLabel
                ? `The page for ${branchLabel} is currently unavailable. Please reach out to the developer for assistance.`
                : "The page you are trying to view is currently unavailable. Please reach out to the developer for assistance."}
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#003399] hover:bg-[#0054a6] rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Branch List
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom row: dots + tagline */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#003399]" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right leading-tight">
          Driven<br />by People.
        </span>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <img src="/szk.png" alt="Suzuki" className="h-7 w-auto object-contain" />
            <span className="text-slate-300">|</span>
            <span>Better Mobility. A Brighter Tomorrow.</span>
          </div>
          <span>© {new Date().getFullYear()} Suzuki Motor Corporation. All rights reserved.</span>
        </div>
      </footer>

      {/* NEED HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Need Help?</h3>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#003399] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Contact the developer</p>
                  <p className="text-xs text-slate-500 mb-2">Reach out to explain what page or branch you need activated.</p>
                  <a
                    href="https://facebook.com/worstcoder.vargas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0054a6] hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.145 2 11.257c0 2.913 1.454 5.512 3.726 7.21V22l3.405-1.869c.909.251 1.871.386 2.869.386 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2z" />
                    </svg>
                    Message Mark Vargas
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#003399] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Pay the developer</p>
                  <p className="text-xs text-slate-500">Payment details will be shared once you've reached out.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#003399] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Get access</p>
                  <p className="text-xs text-slate-500">Your branch will be activated shortly after.</p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}