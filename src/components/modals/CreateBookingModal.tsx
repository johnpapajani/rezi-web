import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  RectangleGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { BookingCreate, BookingCreateCustomer, Table, ServiceOpenInterval, Weekday } from '../../types';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingCreate) => Promise<void>;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  serviceOpenIntervals: ServiceOpenInterval[];
  tables: Table[];
  loading?: boolean;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceId,
  serviceName,
  serviceDurationMinutes,
  serviceOpenIntervals,
  tables,
  loading = false,
}) => {
  const { t } = useTranslation();
  
  // Validate that we have required props
  if (!serviceId || !serviceName || !serviceDurationMinutes) {
    console.warn('CreateBookingModal: Missing required props', {
      serviceId,
      serviceName,
      serviceDurationMinutes
    });
  }

  // Validate duration is reasonable (between 1 minute and 24 hours)
  if (serviceDurationMinutes && (serviceDurationMinutes < 1 || serviceDurationMinutes > 1440)) {
    console.warn('CreateBookingModal: Unusual service duration', {
      serviceDurationMinutes,
      serviceId,
      serviceName
    });
  }
  
  const [formData, setFormData] = useState<{
    customer: BookingCreateCustomer;
    party_size: number;
    table_id: string;
    starts_at: string;
    date: string;
    time: string;
  }>({
    customer: {
      name: '',
      phone: '',
      email: '',
    },
    party_size: 1,
    table_id: '',
    starts_at: '',
    date: '',
    time: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  // Get available tables based on party size
  const availableTables = tables.filter(table => 
    table.is_active && table.seats >= formData.party_size
  );

  // Auto-select first available table when party size changes
  useEffect(() => {
    if (availableTables.length > 0 && !formData.table_id) {
      setFormData(prev => ({ ...prev, table_id: availableTables[0].id }));
    } else if (availableTables.length > 0 && !availableTables.find(t => t.id === formData.table_id)) {
      setFormData(prev => ({ ...prev, table_id: availableTables[0].id }));
    }
  }, [formData.party_size, availableTables, formData.table_id]);

  // Calculate end time based on start time and service duration
  const calculateEndTime = (startDateTime: string): string => {
    const start = new Date(startDateTime);
    const durationMs = serviceDurationMinutes * 60000;
    const end = new Date(start.getTime() + durationMs);
    
    // Format as local time in ISO format (without Z suffix to avoid UTC conversion)
    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    const hours = String(end.getHours()).padStart(2, '0');
    const minutes = String(end.getMinutes()).padStart(2, '0');
    const seconds = String(end.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Convert JavaScript day (0=Sunday) to Weekday enum (1=Monday)
  const jsDateToWeekday = (jsDay: number): Weekday => {
    // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
    // Our enum: 1=Monday, 2=Tuesday, ..., 7=Sunday
    return jsDay === 0 ? Weekday.sunday : jsDay as Weekday;
  };

  // Check if booking time falls within service operating hours
  // This validates that:
  // 1. The service is open on the selected weekday
  // 2. The booking start time is after the service opens
  // 3. The booking end time is before the service closes
  // 4. The entire booking duration fits within a single service interval
  const validateServiceHours = (bookingDate: string, bookingTime: string): string | null => {
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const weekday = jsDateToWeekday(bookingDateTime.getDay());
    
    // Find open intervals for this weekday
    const dayIntervals = serviceOpenIntervals.filter(interval => interval.weekday === weekday);
    
    if (dayIntervals.length === 0) {
      return t('booking.create.errors.serviceClosed');
    }

    const bookingStartTime = bookingTime;
    const bookingEndDateTime = calculateEndTime(`${bookingDate}T${bookingTime}`);
    const bookingEndTime = bookingEndDateTime.split('T')[1].substring(0, 5); // Extract HH:MM from YYYY-MM-DDTHH:MM:SS

    // Check if booking time falls within any open interval
    const isWithinHours = dayIntervals.some(interval => {
      return bookingStartTime >= interval.start_time && bookingEndTime <= interval.end_time;
    });

    if (!isWithinHours) {
      // Format intervals for display
      const intervalsText = dayIntervals
        .map(interval => `${interval.start_time} - ${interval.end_time}`)
        .join(', ');
      
      return t('booking.create.errors.outsideServiceHours').replace('{intervals}', intervalsText);
    }

    return null; // Valid
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updatedData = { ...prev };
      if (field.includes('.')) {
        // Handle nested fields like 'customer.name'
        const [parent, child] = field.split('.');
        if (parent === 'customer') {
          updatedData.customer = {
            ...prev.customer,
            [child]: value
          };
        }
      } else {
        // Handle top-level fields
        if (field === 'party_size') {
          updatedData.party_size = value;
        } else if (field === 'table_id') {
          updatedData.table_id = value;
        } else if (field === 'date') {
          updatedData.date = value;
        } else if (field === 'time') {
          updatedData.time = value;
        }
      }
      return updatedData;
    });

    // Real-time validation for date/time changes
    if (field === 'date' || field === 'time') {
      const dateToCheck = field === 'date' ? value : formData.date;
      const timeToCheck = field === 'time' ? value : formData.time;
      
      if (dateToCheck && timeToCheck) {
        setTimeout(() => {
          const serviceHoursError = validateServiceHours(dateToCheck, timeToCheck);
          setErrors(prev => ({
            ...prev,
            serviceHours: serviceHoursError || ''
          }));
        }, 100); // Small delay to avoid excessive validation calls
      }
    }

    // Clear specific field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Customer validation
    if (!formData.customer.name.trim()) {
      newErrors['customer.name'] = t('booking.create.errors.customerNameRequired');
    }

    if (formData.customer.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.customer.phone)) {
      newErrors['customer.phone'] = t('booking.create.errors.invalidPhone');
    }

    if (formData.customer.email && !/\S+@\S+\.\S+/.test(formData.customer.email)) {
      newErrors['customer.email'] = t('booking.create.errors.invalidEmail');
    }

    // Booking details validation
    if (formData.party_size < 1) {
      newErrors['party_size'] = t('booking.create.errors.invalidPartySize');
    }

    if (!formData.date) {
      newErrors['date'] = t('booking.create.errors.dateRequired');
    }

    if (!formData.time) {
      newErrors['time'] = t('booking.create.errors.timeRequired');
    }

    // Validate booking is not in the past and not too far in the future
    if (formData.date && formData.time) {
      const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      const maxDate = new Date(now);
      maxDate.setMonth(maxDate.getMonth() + 3);
      
      if (bookingDateTime <= now) {
        newErrors['datetime'] = t('booking.create.errors.pastDateTime');
      } else if (bookingDateTime > maxDate) {
        newErrors['datetime'] = t('booking.create.errors.tooFarInFuture');
      } else {
        // Validate service hours if date/time is valid
        const serviceHoursError = validateServiceHours(formData.date, formData.time);
        if (serviceHoursError) {
          newErrors['serviceHours'] = serviceHoursError;
        }
      }
    }

    // Table selection is now optional - backend will auto-allocate if not specified
    // No validation needed for table_id

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const starts_at = `${formData.date}T${formData.time}:00`; // Add seconds for consistency
      const ends_at = calculateEndTime(`${formData.date}T${formData.time}`);

      const bookingData: BookingCreate = {
        service_id: serviceId,
        ...(formData.table_id && { table_id: formData.table_id }), // Only include table_id if selected
        starts_at,
        ends_at,
        party_size: formData.party_size,
        customer: {
          name: formData.customer.name.trim(),
          phone: formData.customer.phone?.trim() || undefined,
          email: formData.customer.email?.trim() || undefined,
        },
      };

      await onSubmit(bookingData);
      onClose();
      resetForm();
    } catch (error: any) {
      // Handle specific service hours validation errors
      let errorMessage = error.message || t('booking.create.errors.submitFailed');
      
      if (errorMessage.includes('operating hours') || errorMessage.includes('service hours')) {
        errorMessage = t('booking.create.errors.outsideServiceHours');
      } else if (errorMessage.includes('Business is closed')) {
        errorMessage = t('booking.create.errors.businessClosed');
      } else if (errorMessage.includes('Service is not available')) {
        errorMessage = t('booking.create.errors.serviceNotAvailable');
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer: { name: '', phone: '', email: '' },
      party_size: 1,
      table_id: '',
      starts_at: '',
      date: '',
      time: '',
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    // Round to next 30-minute increment
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    return now.toTimeString().slice(0, 5);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="min-w-0 pr-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('booking.create.title')}
              </h3>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {t('booking.create.subtitle').replace('{serviceName}', serviceName)}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800 text-sm">{errors.submit}</span>
              </div>
            )}

            {/* Service Hours Information */}
            {serviceOpenIntervals.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-medium text-blue-900">{t('booking.create.serviceHours.title')}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {serviceOpenIntervals
                    .sort((a, b) => a.weekday - b.weekday)
                    .map((interval, index) => {
                      const dayNames = {
                        [Weekday.monday]: t('days.monday'),
                        [Weekday.tuesday]: t('days.tuesday'),
                        [Weekday.wednesday]: t('days.wednesday'),
                        [Weekday.thursday]: t('days.thursday'),
                        [Weekday.friday]: t('days.friday'),
                        [Weekday.saturday]: t('days.saturday'),
                        [Weekday.sunday]: t('days.sunday'),
                      };
                      
                      return (
                        <div key={index} className="text-blue-800">
                          <span className="font-medium">{dayNames[interval.weekday]}:</span>{' '}
                          {interval.start_time} - {interval.end_time}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-medium text-gray-900">
                  {t('booking.create.sections.customer')}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.create.fields.customerName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.customer.name}
                    onChange={(e) => handleInputChange('customer.name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['customer.name'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t('booking.create.placeholders.customerName')}
                  />
                  {errors['customer.name'] && (
                    <p className="text-red-600 text-xs mt-1">{errors['customer.name']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    {t('booking.create.fields.customerPhone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.customer.phone}
                    onChange={(e) => handleInputChange('customer.phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['customer.phone'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t('booking.create.placeholders.customerPhone')}
                  />
                  {errors['customer.phone'] && (
                    <p className="text-red-600 text-xs mt-1">{errors['customer.phone']}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                  {t('booking.create.fields.customerEmail')}
                </label>
                <input
                  type="email"
                  value={formData.customer.email}
                  onChange={(e) => handleInputChange('customer.email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['customer.email'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('booking.create.placeholders.customerEmail')}
                />
                {errors['customer.email'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['customer.email']}</p>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-medium text-gray-900">
                  {t('booking.create.sections.bookingDetails')}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UsersIcon className="w-4 h-4 inline mr-1" />
                    {t('booking.create.fields.partySize')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.party_size}
                    onChange={(e) => handleInputChange('party_size', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['party_size'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['party_size'] && (
                    <p className="text-red-600 text-xs mt-1">{errors['party_size']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                    {t('booking.create.fields.date')} *
                  </label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    max={getMaxDate()}
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['date'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['date'] && (
                    <p className="text-red-600 text-xs mt-1">{errors['date']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    {t('booking.create.fields.time')} *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors['time'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors['time'] && (
                    <p className="text-red-600 text-xs mt-1">{errors['time']}</p>
                  )}
                </div>
              </div>

              {errors['datetime'] && (
                <p className="text-red-600 text-sm">{errors['datetime']}</p>
              )}

              {errors['serviceHours'] && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">{t('booking.create.errors.serviceHoursTitle')}</p>
                    <p className="text-red-700 text-sm">{errors['serviceHours']}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Table Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RectangleGroupIcon className="w-5 h-5 text-purple-600" />
                  <h4 className="text-lg font-medium text-gray-900">
                    {t('booking.create.sections.tableSelection')}
                  </h4>
                  <span className="text-sm text-gray-500">({t('booking.create.optional')})</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {t('booking.create.tableSelectionHint')}
              </p>

              {availableTables.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    {t('booking.create.noTablesAvailable').replace('{partySize}', formData.party_size.toString())}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Auto-assign option */}
                  <label
                    className={`cursor-pointer border-2 rounded-lg p-3 transition-colors ${
                      formData.table_id === ''
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="table_id"
                      value=""
                      checked={formData.table_id === ''}
                      onChange={(e) => handleInputChange('table_id', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('booking.create.autoAssignTable')}</div>
                        <div className="text-sm text-gray-600">
                          {t('booking.create.autoAssignDescription')}
                        </div>
                      </div>
                      {formData.table_id === '' && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </label>
                  
                  {availableTables.map((table) => (
                    <label
                      key={table.id}
                      className={`cursor-pointer border-2 rounded-lg p-3 transition-colors ${
                        formData.table_id === table.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="table_id"
                        value={table.id}
                        checked={formData.table_id === table.id}
                        onChange={(e) => handleInputChange('table_id', e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{table.code}</div>
                          <div className="text-sm text-gray-600">
                            {t('booking.create.tableCapacity').replace('{seats}', table.seats.toString())}
                          </div>
                        </div>
                        {formData.table_id === table.id && (
                          <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {errors['table_id'] && (
                <p className="text-red-600 text-sm">{errors['table_id']}</p>
              )}
            </div>

            {/* Duration Info */}
            {formData.date && formData.time && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <div className="text-sm text-blue-800">
                    <div className="font-medium">
                      {t('booking.create.bookingDuration').replace('{duration}', serviceDurationMinutes.toString())}
                    </div>
                    <div>
                      {t('booking.create.estimatedEndTime').replace('{endTime}', (() => {
                        if (formData.date && formData.time) {
                          const endTimeString = calculateEndTime(`${formData.date}T${formData.time}`);
                          const endTime = new Date(endTimeString);
                          return endTime.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                        }
                        return '--:--';
                      })())}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
              >
                {t('booking.create.actions.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || loading || availableTables.length === 0}
                className="px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 touch-manipulation"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {submitting 
                    ? t('booking.create.actions.creating') 
                    : t('booking.create.actions.create')
                  }
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateBookingModal; 