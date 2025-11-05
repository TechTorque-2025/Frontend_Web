'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectService } from '@/services/projectService';
import { ServiceResponseDto, ServiceStatus } from '@/types/project';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await projectService.listCustomerServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => 
    statusFilter === 'ALL' || service.status === statusFilter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusStyles: Record<ServiceStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const statusFilters: Array<ServiceStatus | 'ALL'> = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Service Jobs</h1>
        <p className="theme-text-muted">View and manage your assigned service jobs</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Total jobs</p>
          <p className="text-2xl font-semibold theme-text-primary">{services.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
            {services.filter(s => s.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">In Progress</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {services.filter(s => s.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Completed</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            {services.filter(s => s.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'theme-bg-secondary theme-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <svg
              className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold theme-text-primary mb-1">No services found</h3>
            <p className="theme-text-muted text-sm">
              {services.length === 0
                ? 'You have no service jobs assigned yet.'
                : `No ${statusFilter.toLowerCase().replace('_', ' ')} services.`}
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Link
              key={service.id}
              href={`/dashboard/services/${service.id}`}
              className="block rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold theme-text-primary">{service.serviceType}</h2>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[service.status]}`}>
                        {service.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="theme-text-muted text-sm">Service ID: {service.id}</p>
                  </div>
                  {service.estimatedCost && (
                    <div className="text-right">
                      <p className="text-sm theme-text-muted">Estimated cost</p>
                      <p className="text-xl font-semibold theme-text-primary">LKR {service.estimatedCost.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {service.description && (
                  <p className="theme-text-secondary text-sm mb-3 line-clamp-2">{service.description}</p>
                )}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div>
                    <span className="block text-xs uppercase tracking-wide theme-text-muted">Appointment</span>
                    <span className="block font-medium theme-text-primary">{service.appointmentId}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wide theme-text-muted">Vehicle</span>
                    <span className="block font-medium theme-text-primary">{service.vehicleId}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wide theme-text-muted">Created</span>
                    <span className="block theme-text-primary">{formatDate(service.createdAt)}</span>
                  </div>
                  {service.completedAt && (
                    <div>
                      <span className="block text-xs uppercase tracking-wide theme-text-muted">Completed</span>
                      <span className="block theme-text-primary">{formatDate(service.completedAt)}</span>
                    </div>
                  )}
                  {service.startedAt && !service.completedAt && (
                    <div>
                      <span className="block text-xs uppercase tracking-wide theme-text-muted">Started</span>
                      <span className="block theme-text-primary">{formatDate(service.startedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
