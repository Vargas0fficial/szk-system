"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentTable from '@/components/AppointmentTable';

export default function AdminPage() {
  const [appointments, setAppointments] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [branchLabel, setBranchLabel] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const router = useRouter();

  // Fetch which branch this logged-in admin belongs to, so the navbar
  // always shows the correct branch name (no static env var needed).
  // If the branch was deactivated after this admin already logged in,
  // this also catches that and shows the "not yet accessible" screen
  // instead of the dashboard.
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data.success) {
          setBlockedMessage(data.error || 'This page is not yet accessible. Please pay the developer: Mark Vargas');
          setBlocked(true);
          // Clear the session so they don't keep landing here on refresh.
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
          return;
        }
        setBranchLabel(data.branchLabel);
      })
      .catch((err) => console.error("Failed to fetch admin session info:", err));
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/appointments/stream');

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === 'initial' || parsedData.type === 'update') {
          setAppointments(parsedData.data);
        }
      } catch (err) {
        console.error("Error parsing incoming live data stream:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection closed or lost. Attempting reconnection...", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/appointments/stream');
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.data || data);
      }
    } catch (err) {
      console.error("Manual database synchronization fallback failed:", err);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  // Branch was deactivated (either at login time, or mid-session) —
  // show this instead of the dashboard.
  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] font-sans px-6">
        <div className="text-center max-w-md">
          <img src="/szk.png" alt="Suzuki Logo" className="h-14 w-auto object-contain mx-auto mb-6 opacity-70" />
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 mb-1">This page is not yet accessible.</p>
          <p className="text-sm text-slate-600 mb-6">
            Please pay the developer:{' '}
            <a
              href="https://facebook.com/worstcoder.vargas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0054a6] font-semibold hover:underline"
            >
              Mark Vargas
            </a>
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-[#003399] hover:text-white hover:border-[#003399] transition-all"
          >
            ← Back to Branch List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/szk.png" alt="Logo" className="h-20 w-auto object-contain" />
            <div className="border-l border-slate-300 pl-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                Service Management System
              </span>
              {branchLabel && (
                <span className="text-xs font-bold text-[#003399] uppercase tracking-widest block">
                  {branchLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Appointment List (editable)</h1>
        <AppointmentForm onSuccess={fetchAdminData} />
        <AppointmentTable data={appointments} onRefresh={fetchAdminData} />
      </main>

    </div>
  );
}