"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentTable from '@/components/AppointmentTable';

export default function AdminPage() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Establish Server-Sent Events connection to the correct stream endpoint
    const eventSource = new EventSource('/api/appointments/stream');

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        // Handle initial load and live database updates seamlessly
        if (parsedData.type === 'initial' || parsedData.type === 'update') {
          setAppointments(parsedData.data);
        }
      } catch (err) {
        console.error("Error parsing incoming live data stream:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection connection closed or lost. Attempting reconnection...", err);
    };

    // Clean up connection when user navigates away from the page
    return () => {
      eventSource.close();
    };
  }, []);

  // Fallback function kept to prevent breaking your child components (Form / Table event triggers)
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

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/szk.png" alt="Logo" className="h-20 w-auto object-contain" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-l border-slate-300 pl-3">
              Service Management System
            </span>
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