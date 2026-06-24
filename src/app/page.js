"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';

const STATUS_STYLES = {
  Confirmed: 'bg-green-100 text-green-700 border border-green-200',
  Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  'On Going': 'bg-blue-100 text-blue-700 border border-blue-200',
  Completed: 'bg-gray-100 text-gray-600 border border-gray-200',
  Cancelled: 'bg-red-100 text-red-700 border border-red-200',
};

const PAGE_SIZE = 10;

export default function PublicPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let eventSource = null;
    let watchdogTimer = null;

    const connectStream = () => {
      if (eventSource) eventSource.close();

      eventSource = new EventSource('/api/appointments/stream');

      const resetWatchdog = () => {
        if (watchdogTimer) clearTimeout(watchdogTimer);
        watchdogTimer = setTimeout(() => {
          console.log("Heartbeat lost. Automatically reconnecting stream in background...");
          connectStream();
        }, 35000);
      };

      resetWatchdog();

      eventSource.onmessage = (event) => {
        resetWatchdog();
        try {
          const payload = JSON.parse(event.data);
          if (payload && typeof payload === 'object') {
            if (Array.isArray(payload.data)) setAppointments(payload.data);
            else if (Array.isArray(payload)) setAppointments(payload);
          }
          setLoading(false);
        } catch (err) {
          console.error('Error parsing SSE payload:', err);
        }
      };

      eventSource.onerror = () => {
        resetWatchdog();
      };
    };

    window.__forceSilentStreamReconnect = () => {
      console.log("Table requested a silent stream reset...");
      connectStream();
    };

    connectStream();

    return () => {
      if (eventSource) eventSource.close();
      if (watchdogTimer) clearTimeout(watchdogTimer);
      delete window.__forceSilentStreamReconnect;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const paginated = appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const formatDateTime = (item) => {
    if (item.date && item.time) {
      const d = new Date(`${item.date}T${item.time}`);
      return {
        date: d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }
    return { date: '—', time: '—' };
  };

  return (
    <div className="h-screen bg-[#f4f7fa] font-sans flex flex-col overflow-hidden">

      {/* NAV */}
      <nav className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/szk.png" alt="Logo" className="h-14 w-auto object-contain" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-l border-slate-300 pl-3">
              Service Management System
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400">Live Appointment Status</span>
        </div>
      </nav>

      {/* MAIN - scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Appointment List</h1>
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium select-none min-h-[40px]">
              {mounted ? (
                <>
                  <span className="text-[#0054a6] font-bold tracking-wider tabular-nums text-base">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-slate-500 font-semibold">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' })}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 animate-pulse text-xs">Loading system time...</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#003399] text-white text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-3 py-2 text-center">Appointment Date & Time</th>
                    <th className="px-3 py-2 text-center">Customer Name</th>
                    <th className="px-3 py-2 text-center">Conduction Sticker</th>
                    <th className="px-3 py-2 text-center">Vehicle Model</th>
                    <th className="px-3 py-2 text-center">Plate Number</th>
                    <th className="px-3 py-2 text-center">Service Type</th>
                    <th className="px-3 py-2 text-center">Advisor</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-10 text-center text-gray-400 animate-pulse">Loading appointments...</td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-10 text-center text-gray-400">No appointments found.</td>
                    </tr>
                  ) : (
                    paginated.map((item) => {
                      const status = item.status || 'Pending';
                      const formatted = formatDateTime(item);
                      return (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-1.5 text-center text-gray-700 font-medium">
                            {formatted.date}<br />
                            <span className="text-[10px] text-gray-400">{formatted.time}</span>
                          </td>
                          <td className="px-3 py-1.5 text-center font-bold text-gray-800 uppercase">{item.customer}</td>
                          <td className="px-3 py-1.5 text-center font-mono text-gray-600">{item.sticker}</td>
                          <td className="px-3 py-1.5 text-center text-gray-600">{item.model || '—'}</td>
                          <td className="px-3 py-1.5 text-center font-mono text-gray-600">{item.plate || '—'}</td>
                          <td className="px-3 py-1.5 text-center text-gray-600">{item.serviceType || 'PMS'}</td>
                          <td className="px-3 py-1.5 text-center text-gray-600">{item.advisor || '—'}</td>
                          <td className="px-3 py-1.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLES[status] || STATUS_STYLES['Pending']}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER - laging naka-pin sa ibaba, kasama ang pagination */}
      <footer className="bg-white border-t border-slate-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] flex-shrink-0">

        {/* PAGINATION ROW */}
        <div className="border-b border-gray-100 px-6 py-2 flex justify-between items-center max-w-7xl mx-auto w-full">
          <p className="text-[11px] text-gray-400">
            Showing {appointments.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(page * PAGE_SIZE, appointments.length)} of {appointments.length} entries
          </p>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >«</button>
            {pageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`e-${i}`} className="px-2 py-1 text-xs text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${page === p ? 'bg-[#0054a6] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >{p}</button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >»</button>
          </div>
        </div>

        {/* BRANDING + BMC ROW */}
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <img src="/szk.png" alt="Suzuki Logo" className="h-6 w-auto object-contain opacity-80" style={{ maxWidth: '80px' }} />
            <div>
              <p className="text-xs font-semibold text-slate-600">Service Management System</p>
              <p className="text-[10px] text-slate-400">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Created by: Mark Vargas ❤️
            </p>
            <a
              href="https://www.buymeacoffee.com/worstcoder.vargas"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:scale-105 active:scale-95 hover:shadow-md rounded-lg inline-block"
            >
              <img src="/bmc-button-640x180.png" alt="Buy me a coffee" className="h-9 w-auto object-contain" />
            </a>
          </div>
        </div>

      </footer>
    </div>
  );
}