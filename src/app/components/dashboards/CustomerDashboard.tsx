"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import appointmentService from "@/services/appointmentService";
import paymentService from "@/services/paymentService";
import { vehicleService } from "@/services/vehicleService";
import type { AppointmentResponseDto } from "@/types/appointment";
import type { UserDto } from "@/types/api";
import type { InvoiceResponseDto } from "@/types/payment";
import type { VehicleListItem } from "@/types/vehicle";
import AIChatWidget from "@/app/components/chatbot/AIChatWidget";

interface CustomerDashboardProps {
  profile: UserDto;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ profile }) => {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [vehicleData, appointmentData, invoiceData] = await Promise.all([
          vehicleService.getMyVehicles(),
          appointmentService.listAppointments(),
          paymentService.getUnpaidInvoices(),
        ]);

        setVehicles(vehicleData);
        setAppointments(appointmentData);
        setInvoices(invoiceData);
        setError(null);
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load dashboard information";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const upcomingAppointments = useMemo(() =>
    appointments
      .filter((appointment) => new Date(appointment.requestedDateTime) >= new Date())
      .sort((a, b) => new Date(a.requestedDateTime).getTime() - new Date(b.requestedDateTime).getTime())
      .slice(0, 3),
  [appointments]);

  const overdueInvoices = useMemo(() =>
    invoices.filter((invoice) => invoice.status === "OVERDUE" || invoice.status === "SENT"),
  [invoices]);

  if (loading) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Customer Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! Manage your vehicle services with ease.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="automotive-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="automotive-accent w-3 h-3 rounded-full mr-3" />
              <h3 className="text-xl font-semibold theme-text-primary">My Vehicles</h3>
            </div>
            <span className="text-2xl font-semibold theme-text-primary">{vehicles.length}</span>
          </div>
          <p className="theme-text-muted text-sm mb-4">Manage and track all your vehicles</p>
          <div className="space-y-2">
            <Link href="/dashboard/vehicles" className="theme-button-primary text-center block">
              View My Vehicles
            </Link>
            <Link href="/dashboard/vehicles" className="theme-button-secondary text-center block">
              Add New Vehicle
            </Link>
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="automotive-accent w-3 h-3 rounded-full mr-3" />
              <h3 className="text-xl font-semibold theme-text-primary">Upcoming Appointments</h3>
            </div>
            <span className="text-2xl font-semibold theme-text-primary">{upcomingAppointments.length}</span>
          </div>
          <p className="theme-text-muted text-sm mb-4">Stay on top of your scheduled services</p>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="theme-text-muted text-sm">No upcoming appointments. Book your next service today.</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <p className="theme-text-primary font-medium text-sm">{appointment.serviceType}</p>
                  <p className="theme-text-muted text-xs">
                    {new Date(appointment.requestedDateTime).toLocaleString()}
                  </p>
                  <Link
                    href={`/dashboard/appointments/${appointment.id}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                  >
                    View details
                  </Link>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2 mt-4">
            <Link href="/dashboard/appointments/book" className="theme-button-primary text-center block">
              Book Appointment
            </Link>
            <Link href="/dashboard/appointments" className="theme-button-secondary text-center block">
              View All Appointments
            </Link>
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="automotive-accent w-3 h-3 rounded-full mr-3" />
              <h3 className="text-xl font-semibold theme-text-primary">Billing Summary</h3>
            </div>
            <span className="text-2xl font-semibold theme-text-primary">{overdueInvoices.length}</span>
          </div>
          <p className="theme-text-muted text-sm mb-4">Review outstanding invoices and recent payments</p>
          <div className="space-y-3">
            {overdueInvoices.length === 0 ? (
              <p className="theme-text-muted text-sm">No outstanding invoices.</p>
            ) : (
              overdueInvoices.slice(0, 3).map((invoice) => (
                <div key={invoice.invoiceId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <p className="theme-text-primary font-medium text-sm">Invoice {invoice.invoiceNumber}</p>
                  <p className="theme-text-muted text-xs mb-1">Amount due: LKR {(invoice.totalAmount ?? 0).toLocaleString()}</p>
                  <Link
                    href={`/dashboard/invoices/${invoice.invoiceId}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Settle invoice
                  </Link>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2 mt-4">
            <Link href="/dashboard/invoices" className="theme-button-primary text-center block">
              View Invoices
            </Link>
            <Link href="/dashboard/payments" className="theme-button-secondary text-center block">
              Payment History
            </Link>
          </div>
        </div>
      </div>

      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/vehicles"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <svg className="mx-auto w-12 h-12 mb-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l1.5-4.5A2 2 0 0 1 6.4 6h11.2a2 2 0 0 1 1.9 1.5L21 12" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM19 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18v2H3v-2z" />
            </svg>
            <p className="theme-text-primary font-medium">Vehicles</p>
          </Link>
          <Link
            href="/dashboard/appointments"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <svg className="mx-auto w-12 h-12 mb-2 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="theme-text-primary font-medium">Appointments</p>
          </Link>
          <Link
            href="/dashboard/projects"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <svg className="mx-auto w-12 h-12 mb-2 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <p className="theme-text-primary font-medium">Projects</p>
          </Link>
          <Link
            href="/profile"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <svg className="mx-auto w-12 h-12 mb-2 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="theme-text-primary font-medium">Profile</p>
          </Link>
        </div>
      </div>

      {/* Floating AI Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[480px] h-[600px] flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">TechTorque AI Assistant</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIChatWidget />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2"
            aria-label="Open chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="font-medium">Chat</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;

