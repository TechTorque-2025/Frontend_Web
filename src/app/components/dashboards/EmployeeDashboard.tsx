'use client'
import React from 'react';
import Link from 'next/link';
import type { UserDto } from '../../../types/api';

interface EmployeeDashboardProps {
  profile: UserDto;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ profile }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Employee Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! Ready to provide excellent service today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Schedule */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Today&apos;s Schedule</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="theme-text-muted">Shift Start</span>
              <span className="theme-text-primary font-semibold">8:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Shift End</span>
              <span className="theme-text-primary font-semibold">5:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Appointments</span>
              <span className="theme-text-primary font-semibold">6</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Break Time</span>
              <span className="theme-text-primary font-semibold">12:00 PM</span>
            </div>
          </div>
        </div>

        {/* My Tasks */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Current Tasks</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
              <p className="theme-text-primary font-medium text-sm">Oil Change - Bay 2</p>
              <p className="theme-text-muted text-xs">Due: 2:30 PM</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
              <p className="theme-text-primary font-medium text-sm">Brake Inspection - Bay 1</p>
              <p className="theme-text-muted text-xs">Due: 3:00 PM</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
              <p className="theme-text-primary font-medium text-sm">Tire Rotation - Bay 3</p>
              <p className="theme-text-muted text-xs">Due: 4:00 PM</p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="theme-text-muted">Jobs Completed</span>
              <span className="theme-text-primary font-semibold">127</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Customer Rating</span>
              <span className="theme-text-primary font-semibold">4.9/5</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">On-Time Rate</span>
              <span className="theme-text-primary font-semibold">98%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Today&apos;s Appointments</h3>
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="theme-text-primary font-medium">Oil Change - Honda Civic</p>
                  <p className="theme-text-muted text-sm">Customer: John Smith | 2:00 PM - 2:30 PM</p>
                  <p className="theme-text-muted text-xs">Bay 2 | License: ABC-123</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Ready</span>
              </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="theme-text-primary font-medium">Brake Inspection - Toyota Camry</p>
                  <p className="theme-text-muted text-sm">Customer: Sarah Wilson | 3:00 PM - 3:45 PM</p>
                  <p className="theme-text-muted text-xs">Bay 1 | License: XYZ-789</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Waiting</span>
              </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="theme-text-primary font-medium">Tire Rotation - Ford F-150</p>
                  <p className="theme-text-muted text-sm">Customer: Mike Johnson | 4:00 PM - 4:30 PM</p>
                  <p className="theme-text-muted text-xs">Bay 3 | License: DEF-456</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Scheduled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Service Tools & Resources</h3>
          <div className="space-y-4">
            <Link href="/employee/service-manual" className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center">
                <div className="automotive-accent w-2 h-2 rounded-full mr-3"></div>
                <span className="theme-text-primary font-medium">Service Manual</span>
              </div>
              <p className="theme-text-muted text-sm mt-1">Access repair procedures and specifications</p>
            </Link>
            <Link href="/employee/parts-catalog" className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center">
                <div className="automotive-accent w-2 h-2 rounded-full mr-3"></div>
                <span className="theme-text-primary font-medium">Parts Catalog</span>
              </div>
              <p className="theme-text-muted text-sm mt-1">Find part numbers and availability</p>
            </Link>
            <Link href="/employee/diagnostic-tools" className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center">
                <div className="automotive-accent w-2 h-2 rounded-full mr-3"></div>
                <span className="theme-text-primary font-medium">Diagnostic Tools</span>
              </div>
              <p className="theme-text-muted text-sm mt-1">Access diagnostic software and codes</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/employee/clock-in" className="theme-button-primary text-center">
            Clock In/Out
          </Link>
          <Link href="/employee/timesheet" className="theme-button-primary text-center">
            View Timesheet
          </Link>
          <Link href="/employee/schedule" className="theme-button-primary text-center">
            My Schedule
          </Link>
          <Link href="/profile" className="theme-button-secondary text-center">
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;