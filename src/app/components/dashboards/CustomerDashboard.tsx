'use client'
import React from 'react';
import Link from 'next/link';
import type { UserDto } from '../../../types/api';

interface CustomerDashboardProps {
  profile: UserDto;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ profile }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Customer Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! Manage your vehicle services with ease.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* My Vehicles */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">My Vehicles</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="theme-text-primary font-medium">2019 Honda Civic</p>
              <p className="theme-text-muted text-sm">License: ABC-123</p>
              <p className="theme-text-muted text-xs">Last Service: Oil Change - 2 weeks ago</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="theme-text-primary font-medium">2021 Toyota RAV4</p>
              <p className="theme-text-muted text-sm">License: XYZ-789</p>
              <p className="theme-text-muted text-xs">Last Service: Brake Inspection - 1 month ago</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/customer/vehicles/add" className="theme-button-secondary text-center block">
              Add Vehicle
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Upcoming Services</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
              <p className="theme-text-primary font-medium">Oil Change</p>
              <p className="theme-text-muted text-sm">Tomorrow, 2:00 PM</p>
              <p className="theme-text-muted text-xs">Honda Civic - Confirmed</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
              <p className="theme-text-primary font-medium">Brake Inspection</p>
              <p className="theme-text-muted text-sm">Next Week, 10:00 AM</p>
              <p className="theme-text-muted text-xs">Toyota RAV4 - Pending</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/customer/appointments/book" className="theme-button-primary text-center block">
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Service History */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Recent Services</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="theme-text-primary font-medium text-sm">Oil Change</p>
                <p className="theme-text-muted text-xs">Honda Civic - $45.00</p>
              </div>
              <span className="theme-text-muted text-xs">2 weeks ago</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="theme-text-primary font-medium text-sm">Tire Rotation</p>
                <p className="theme-text-muted text-xs">Toyota RAV4 - $35.00</p>
              </div>
              <span className="theme-text-muted text-xs">1 month ago</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="theme-text-primary font-medium text-sm">Brake Pads</p>
                <p className="theme-text-muted text-xs">Honda Civic - $180.00</p>
              </div>
              <span className="theme-text-muted text-xs">3 months ago</span>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/customer/history" className="theme-button-secondary text-center block">
              View All History
            </Link>
          </div>
        </div>
      </div>

      {/* Available Services */}
      <div className="automotive-card p-6 mb-8">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Available Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="automotive-accent w-2 h-2 rounded-full mr-2"></div>
              <h4 className="theme-text-primary font-medium">Oil Change</h4>
            </div>
            <p className="theme-text-muted text-sm mb-2">Regular maintenance to keep your engine running smoothly</p>
            <p className="theme-text-primary font-semibold">Starting at $39.99</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="automotive-accent w-2 h-2 rounded-full mr-2"></div>
              <h4 className="theme-text-primary font-medium">Brake Service</h4>
            </div>
            <p className="theme-text-muted text-sm mb-2">Comprehensive brake inspection and repair services</p>
            <p className="theme-text-primary font-semibold">Starting at $89.99</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="automotive-accent w-2 h-2 rounded-full mr-2"></div>
              <h4 className="theme-text-primary font-medium">Tire Services</h4>
            </div>
            <p className="theme-text-muted text-sm mb-2">Tire rotation, balancing, and replacement services</p>
            <p className="theme-text-primary font-semibold">Starting at $29.99</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="automotive-accent w-2 h-2 rounded-full mr-2"></div>
              <h4 className="theme-text-primary font-medium">Engine Diagnostic</h4>
            </div>
            <p className="theme-text-muted text-sm mb-2">Advanced diagnostics to identify engine issues</p>
            <p className="theme-text-primary font-semibold">Starting at $79.99</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="automotive-accent w-2 h-2 rounded-full mr-2"></div>
              <h4 className="theme-text-primary font-medium">AC Service</h4>
            </div>
            <p className="theme-text-muted text-sm mb-2">Air conditioning repair and maintenance</p>
            <p className="theme-text-primary font-semibold">Starting at $99.99</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="automotive-accent w-2 h-2 rounded-full mr-2"></div>
              <h4 className="theme-text-primary font-medium">Battery Service</h4>
            </div>
            <p className="theme-text-muted text-sm mb-2">Battery testing, maintenance, and replacement</p>
            <p className="theme-text-primary font-semibold">Starting at $49.99</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/customer/appointments/book" className="theme-button-primary text-center">
            Book Service
          </Link>
          <Link href="/customer/appointments" className="theme-button-primary text-center">
            My Appointments
          </Link>
          <Link href="/customer/vehicles" className="theme-button-primary text-center">
            My Vehicles
          </Link>
          <Link href="/profile" className="theme-button-secondary text-center">
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;