'use client'
import React from 'react';
import Link from 'next/link';
import type { UserDto } from '../../../types/api';

interface AdminDashboardProps {
  profile: UserDto;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Admin Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! Manage your organization efficiently.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Overview Stats */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Today&apos;s Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="theme-text-muted">New Appointments</span>
              <span className="theme-text-primary font-semibold">12</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Active Employees</span>
              <span className="theme-text-primary font-semibold">34</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Services Available</span>
              <span className="theme-text-primary font-semibold">18</span>
            </div>
          </div>
        </div>

        {/* Staff Management */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Staff Management</h3>
          </div>
          <div className="space-y-3">
            <Link href="/admin/employees" className="block theme-button-secondary text-center">
              Manage Employees
            </Link>
            <Link href="/admin/schedules" className="block theme-button-secondary text-center">
              Work Schedules
            </Link>
            <Link href="/admin/payroll" className="block theme-button-secondary text-center">
              Payroll System
            </Link>
          </div>
        </div>

        {/* Service Management */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Service Management</h3>
          </div>
          <div className="space-y-3">
            <Link href="/admin/services" className="block theme-button-secondary text-center">
              Manage Services
            </Link>
            <Link href="/admin/pricing" className="block theme-button-secondary text-center">
              Service Pricing
            </Link>
            <Link href="/admin/inventory" className="block theme-button-secondary text-center">
              Parts Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Appointment Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Recent Appointments</h3>
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="theme-text-primary font-medium">Oil Change - John Smith</p>
                  <p className="theme-text-muted text-sm">Today, 2:00 PM</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Confirmed</span>
              </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="theme-text-primary font-medium">Brake Inspection - Sarah Wilson</p>
                  <p className="theme-text-muted text-sm">Today, 3:30 PM</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>
              </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="theme-text-primary font-medium">Engine Diagnostic - Mike Johnson</p>
                  <p className="theme-text-muted text-sm">Tomorrow, 9:00 AM</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Scheduled</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/appointments" className="theme-button-primary w-full text-center block">
              View All Appointments
            </Link>
          </div>
        </div>

        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Business Analytics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="theme-text-muted">Monthly Revenue</span>
                <span className="theme-text-primary font-semibold">$24,500</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
              <p className="theme-text-muted text-xs mt-1">Target: $30,000</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="theme-text-muted">Customer Satisfaction</span>
                <span className="theme-text-primary font-semibold">4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="theme-text-muted">Service Completion Rate</span>
                <span className="theme-text-primary font-semibold">94%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/add-employee" className="theme-button-primary text-center">
            Add Employee
          </Link>
          <Link href="/admin/new-service" className="theme-button-primary text-center">
            Add Service
          </Link>
          <Link href="/admin/reports" className="theme-button-primary text-center">
            Generate Reports
          </Link>
          <Link href="/profile" className="theme-button-secondary text-center">
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;