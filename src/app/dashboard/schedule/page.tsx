'use client';

import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { AppointmentResponseDto } from '@/types/appointment';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function SchedulePage() {
  const { roles, loading: rolesLoading } = useDashboard();
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      // Get appointments for the selected date
      const allAppointments = await appointmentService.listAppointments();
      const filtered = allAppointments.filter((apt: AppointmentResponseDto) => {
        const aptDate = new Date(apt.requestedDateTime).toISOString().split('T')[0];
        return aptDate === selectedDate;
      });
      setAppointments(filtered.sort((a: AppointmentResponseDto, b: AppointmentResponseDto) => 
        new Date(a.requestedDateTime).getTime() - new Date(b.requestedDateTime).getTime()
      ));
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      IN_PROGRESS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      NO_SHOW: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Check if user has permission to access this page
  const hasRole = (role: string) => roles?.includes(role);
  const hasAccess = hasRole('EMPLOYEE') || hasRole('ADMIN') || hasRole('SUPER_ADMIN');
  const isAdmin = hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  if (rolesLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Block access for customers
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center">
          <svg
            className="mx-auto w-16 h-16 text-red-600 dark:text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">
            This page is only accessible to employees, admins, and super admins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">
          {isAdmin ? 'All Schedules' : 'My Schedule'}
        </h1>
        <p className="theme-text-muted">
          {isAdmin ? 'View all appointment schedules' : 'View your daily appointment schedule'}
        </p>
      </div>

      {/* Date Navigation */}
      <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Previous day"
            >
              <svg className="w-6 h-6 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm theme-text-muted mt-1">{formatDate(selectedDate)}</p>
            </div>
            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Next day"
            >
              <svg className="w-6 h-6 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="theme-button-secondary"
          >
            Today
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Total</p>
          <p className="text-2xl font-semibold theme-text-primary">{appointments.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Confirmed</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {appointments.filter(a => a.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">In Progress</p>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
            {appointments.filter(a => a.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Completed</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            {appointments.filter(a => a.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Appointments Timeline */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold theme-text-primary">Schedule</h2>
        </div>
        
        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold theme-text-primary mb-1">No appointments</h3>
            <p className="theme-text-muted text-sm">
              {isAdmin ? 'There are no appointments scheduled for this day' : 'You have no appointments scheduled for this day'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Time */}
                  <div className="flex-shrink-0 w-24 text-right">
                    <p className="text-lg font-bold theme-text-primary">{formatTime(appointment.requestedDateTime)}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-shrink-0 flex flex-col items-center pt-1">
                    <div className={`w-3 h-3 rounded-full ${
                      appointment.status === 'COMPLETED' ? 'bg-green-600' :
                      appointment.status === 'IN_PROGRESS' ? 'bg-purple-600' :
                      appointment.status === 'CONFIRMED' ? 'bg-blue-600' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1"></div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold theme-text-primary mb-1">
                      {appointment.serviceType}
                    </h3>
                    <p className="theme-text-secondary text-sm mb-2">{appointment.specialInstructions || 'No special instructions'}</p>
                    <div className="flex flex-wrap gap-4 text-sm theme-text-muted">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Customer: {appointment.customerId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        <span>Vehicle: {appointment.vehicleId}</span>
                      </div>
                      {appointment.assignedEmployeeIds && appointment.assignedEmployeeIds.length > 0 && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Assigned: {appointment.assignedEmployeeIds.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
