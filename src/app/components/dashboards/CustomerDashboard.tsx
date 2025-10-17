"use client";
import React from "react";
import Link from "next/link";
import type { UserDto } from "../../../types/api";

interface CustomerDashboardProps {
  profile: UserDto;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ profile }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">
          Customer Dashboard
        </h1>
        <p className="theme-text-muted">
          Welcome back, {profile.username}! Manage your vehicle services with
          ease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* My Vehicles */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">
              My Vehicles
            </h3>
          </div>
          <p className="theme-text-muted text-sm mb-4">
            Manage and track all your vehicles
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard/vehicles"
              className="theme-button-primary text-center block"
            >
              View My Vehicles
            </Link>
            <Link
              href="/dashboard/vehicles"
              className="theme-button-secondary text-center block"
            >
              Add New Vehicle
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">
              Appointments
            </h3>
          </div>
          <p className="theme-text-muted text-sm mb-4">
            Schedule and manage service appointments
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href="/customer/appointments/book"
              className="theme-button-primary text-center block"
            >
              Book Appointment
            </Link>
            <Link
              href="/customer/appointments"
              className="theme-button-secondary text-center block"
            >
              View Appointments
            </Link>
          </div>
        </div>

        {/* Service History */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">
              Service History
            </h3>
          </div>
          <p className="theme-text-muted text-sm mb-4">
            View past services and maintenance records
          </p>
          <div className="mt-4">
            <Link
              href="/customer/history"
              className="theme-button-secondary text-center block"
            >
              View All History
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/vehicles"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🚗</div>
            <p className="theme-text-primary font-medium">Vehicles</p>
          </Link>
          <Link
            href="/customer/appointments"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📅</div>
            <p className="theme-text-primary font-medium">Appointments</p>
          </Link>
          <Link
            href="/customer/history"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📋</div>
            <p className="theme-text-primary font-medium">History</p>
          </Link>
          <Link
            href="/profile"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <div className="text-3xl mb-2">👤</div>
            <p className="theme-text-primary font-medium">Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

