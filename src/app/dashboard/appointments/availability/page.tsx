"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import type {
	AvailabilityResponseDto,
	CalendarDayDto,
	CalendarResponseDto,
	ServiceTypeResponseDto,
} from '@/types/appointment';

interface MonthState {
	year: number;
	month: number;
}

const getMonthState = (date: Date): MonthState => ({
	year: date.getFullYear(),
	month: date.getMonth() + 1,
});

const formatDateLabel = (date: string, options?: Intl.DateTimeFormatOptions): string => {
	return new Date(date).toLocaleDateString(undefined, options);
};

export default function AppointmentAvailabilityPage() {
	const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponseDto[]>([]);
	const [serviceTypesLoading, setServiceTypesLoading] = useState(true);

	const [monthState, setMonthState] = useState<MonthState>(() => getMonthState(new Date()));
	const [calendar, setCalendar] = useState<CalendarResponseDto | null>(null);
	const [calendarLoading, setCalendarLoading] = useState(true);
		const [shouldAutoSelect, setShouldAutoSelect] = useState(true);

	const [selectedServiceTypeId, setSelectedServiceTypeId] = useState('');
	const [selectedDay, setSelectedDay] = useState<CalendarDayDto | null>(null);
	const [availability, setAvailability] = useState<AvailabilityResponseDto | null>(null);
	const [availabilityLoading, setAvailabilityLoading] = useState(false);

	const [error, setError] = useState<string | null>(null);

	const selectedServiceType = useMemo(() => (
		serviceTypes.find((service) => service.id === selectedServiceTypeId) ?? null
	), [serviceTypes, selectedServiceTypeId]);

	useEffect(() => {
		const fetchServiceTypes = async () => {
			try {
				setServiceTypesLoading(true);
				const services = await appointmentService.getAllServiceTypes(false);
				setServiceTypes(services);
				setError(null);
			} catch (err: unknown) {
				const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
					?? 'Failed to load service types';
				setError(message);
			} finally {
				setServiceTypesLoading(false);
			}
		};

		void fetchServiceTypes();
	}, []);

		useEffect(() => {
		const fetchCalendar = async () => {
			try {
				setCalendarLoading(true);
				const data = await appointmentService.getMonthlyCalendar(monthState.year, monthState.month);
				setCalendar(data);
				setError(null);

						if (shouldAutoSelect && data.days.length > 0) {
							setSelectedDay(data.days[0]);
				}
						setShouldAutoSelect(false);
			} catch (err: unknown) {
				const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
					?? 'Failed to load calendar availability';
				setError(message);
				setCalendar(null);
			} finally {
				setCalendarLoading(false);
			}
		};

		void fetchCalendar();
		}, [monthState, shouldAutoSelect]);

	const refreshAvailability = useCallback(async (date: string, serviceTypeId: string) => {
		const matchedService = serviceTypes.find((service) => service.id === serviceTypeId);
		const duration = matchedService?.estimatedDurationMinutes ?? 60;

		try {
			setAvailabilityLoading(true);
			const result = await appointmentService.checkAvailability({
				date,
				serviceType: serviceTypeId,
				duration,
			});
			setAvailability(result);
			setError(null);
		} catch (err: unknown) {
			const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
				?? 'Failed to check availability for the selected date';
			setError(message);
			setAvailability(null);
		} finally {
			setAvailabilityLoading(false);
		}
	}, [serviceTypes]);

	useEffect(() => {
		if (!selectedDay || !selectedServiceTypeId) {
			setAvailability(null);
			return;
		}

		void refreshAvailability(selectedDay.date, selectedServiceTypeId);
	}, [selectedDay, selectedServiceTypeId, refreshAvailability]);

	const handleMonthChange = (direction: 'prev' | 'next') => {
		const base = new Date(monthState.year, monthState.month - 1, 1);
		base.setMonth(base.getMonth() + (direction === 'next' ? 1 : -1));
		setMonthState(getMonthState(base));
		setSelectedDay(null);
		setAvailability(null);
			setShouldAutoSelect(true);
	};

	const handleDaySelect = (day: CalendarDayDto) => {
		setSelectedDay(day);
	};

	const handleServiceTypeChange = (value: string) => {
		setSelectedServiceTypeId(value);
		if (!value) {
			setAvailability(null);
		}
	};

	const isLoading = serviceTypesLoading || calendarLoading;
	const monthLabel = new Date(monthState.year, monthState.month - 1)
		.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

	const availableSlots = availability?.availableSlots.filter((slot) => slot.available) ?? [];

	return (
		<div className="space-y-8">
			<div className="max-w-4xl">
				<h1 className="text-3xl font-bold theme-text-primary mb-2">Availability Planner</h1>
				<p className="theme-text-muted">
					Check technician bay availability by service type before confirming a customer booking.
				</p>
			</div>

			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
					{error}
				</div>
			)}

			<div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
				<section className="automotive-card p-6 space-y-5">
					<div>
						<label className="block text-sm font-medium theme-text-primary mb-2">Service type</label>
						<select
							value={selectedServiceTypeId}
							onChange={(event) => handleServiceTypeChange(event.target.value)}
							className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
							disabled={serviceTypesLoading}
						>
							<option value="">Select service to view availability</option>
							{serviceTypes.map((service) => (
								<option key={service.id} value={service.id}>
									{service.name} • {service.estimatedDurationMinutes} mins
								</option>
							))}
						</select>
												{selectedServiceType && (
													<p className="mt-2 text-xs theme-text-muted">
														Estimated duration {selectedServiceType.estimatedDurationMinutes} mins - Base price LKR {selectedServiceType.basePriceLKR.toLocaleString()}
													</p>
												)}
					</div>

					<div className="flex items-center justify-between">
						<button
							type="button"
							className="theme-button-secondary"
							onClick={() => handleMonthChange('prev')}
							disabled={calendarLoading}
						>
							Previous month
						</button>
						<div className="text-lg font-semibold theme-text-primary">{monthLabel}</div>
						<button
							type="button"
							className="theme-button-secondary"
							onClick={() => handleMonthChange('next')}
							disabled={calendarLoading}
						>
							Next month
						</button>
					</div>

					{isLoading ? (
						<div className="p-6 text-center theme-text-muted">Loading availability calendar...</div>
					) : (!calendar || calendar.days.length === 0) ? (
						<div className="p-6 text-center theme-text-muted">No calendar data available.</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{calendar.days.map((day) => {
								const isSelected = selectedDay?.date === day.date;
								const appointmentBadge = `${day.appointmentCount} appointment${day.appointmentCount === 1 ? '' : 's'}`;

								return (
									<button
										key={day.date}
										type="button"
										onClick={() => handleDaySelect(day)}
										className={`text-left rounded-lg border px-4 py-3 transition-colors ${
											isSelected
												? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
												: 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
										}`}
									>
										<div className="flex items-center justify-between">
											<span className="font-semibold theme-text-primary">
												{formatDateLabel(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}
											</span>
											<span className="text-xs theme-text-muted">{appointmentBadge}</span>
										</div>
										{day.holiday && (
											<p className="mt-2 text-xs text-amber-600 dark:text-amber-300 font-medium">
												Holiday: {day.holidayName}
											</p>
										)}
										{!day.holiday && day.appointments.length > 0 && (
											<p className="mt-2 text-xs theme-text-muted">
												Earliest booking at {formatDateLabel(`${day.date}T${day.appointments[0].time}`, { hour: '2-digit', minute: '2-digit' })}
											</p>
										)}
									</button>
								);
							})}
						</div>
					)}
				</section>

				<section className="space-y-6">
					<div className="automotive-card p-6">
						{!selectedDay ? (
							<p className="theme-text-muted text-sm">Select a day to inspect available slots.</p>
						) : (
							<div className="space-y-4">
								<div>
									<h2 className="text-xl font-semibold theme-text-primary">
										{formatDateLabel(selectedDay.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
									</h2>
									<p className="theme-text-muted text-sm">
										{selectedDay.appointmentCount} scheduled appointment{selectedDay.appointmentCount === 1 ? '' : 's'}
									</p>
								</div>

								{selectedDay.holiday && (
									<div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-900/20 px-4 py-3 text-sm">
										<p className="font-medium text-amber-700 dark:text-amber-300">Workshop closed</p>
										<p className="text-amber-600 dark:text-amber-200">{selectedDay.holidayName}</p>
									</div>
								)}

								{availabilityLoading ? (
									<p className="theme-text-muted text-sm">Fetching available slots...</p>
								) : !selectedServiceTypeId ? (
									<p className="theme-text-muted text-sm">Select a service type to view available slots.</p>
								) : availability ? (
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold theme-text-primary">Available slots</h3>
											<span className="text-xs theme-text-muted">{availableSlots.length} open</span>
										</div>
										{availableSlots.length === 0 ? (
											<p className="text-sm theme-text-muted">No open slots for this service on the selected date. Consider another date or service bay.</p>
										) : (
											<div className="grid gap-2 md:grid-cols-2">
												{availableSlots.map((slot) => (
													<div
														key={`${slot.startTime}-${slot.endTime}-${slot.bayId ?? 'default'}`}
														className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3"
													>
														<p className="font-medium theme-text-primary">
															{formatDateLabel(slot.startTime, { hour: '2-digit', minute: '2-digit' })}
															{' – '}
															{formatDateLabel(slot.endTime, { hour: '2-digit', minute: '2-digit' })}
														</p>
														{slot.bayName && (
															<p className="text-xs theme-text-muted">Bay: {slot.bayName}</p>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								) : (
									<p className="theme-text-muted text-sm">Select a date to load availability.</p>
								)}

								{selectedDay.appointments.length > 0 && (
									<div className="space-y-3">
										<h3 className="font-semibold theme-text-primary">Scheduled appointments</h3>
										<div className="space-y-2">
											{selectedDay.appointments.map((appointment) => (
												<div
													key={appointment.id}
													className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm"
												>
													<div className="flex items-center justify-between">
														<span className="font-medium theme-text-primary">#{appointment.confirmationNumber}</span>
														<span className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">{appointment.status}</span>
													</div>
													<p className="theme-text-muted">
														{appointment.serviceType} at {formatDateLabel(`${selectedDay.date}T${appointment.time}`, { hour: '2-digit', minute: '2-digit' })}
													</p>
													{appointment.bayName && (
														<p className="text-xs theme-text-muted">Bay: {appointment.bayName}</p>
													)}
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{calendar?.statistics && (
						<div className="automotive-card p-6">
							<h3 className="text-lg font-semibold theme-text-primary mb-4">Monthly snapshot</h3>
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
									<p className="text-xs uppercase tracking-wide theme-text-muted">Total appointments</p>
									<p className="text-2xl font-semibold theme-text-primary">{calendar.statistics.totalAppointments}</p>
								</div>
								<div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
									<p className="text-xs uppercase tracking-wide theme-text-muted">Confirmed</p>
									<p className="text-2xl font-semibold theme-text-primary">{calendar.statistics.confirmedAppointments}</p>
								</div>
								<div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
									<p className="text-xs uppercase tracking-wide theme-text-muted">Completed</p>
									<p className="text-2xl font-semibold theme-text-primary">{calendar.statistics.completedAppointments}</p>
								</div>
								<div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
									<p className="text-xs uppercase tracking-wide theme-text-muted">Pending</p>
									<p className="text-2xl font-semibold theme-text-primary">{calendar.statistics.pendingAppointments}</p>
								</div>
							</div>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}