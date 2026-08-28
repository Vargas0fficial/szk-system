import Link from 'next/link';
import { BRANCHES } from '@/branches';

export const dynamic = "force-dynamic";

export default function BranchSelectorPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans flex flex-col items-center justify-center px-6">
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

      <Link href="/login" className="text-xs text-slate-400 hover:text-[#003399] mt-10">
        Admin Login →
      </Link>
    </div>
  );
}