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
import { BookingCreate, BookingCreateCustomer, Table } from '../../types';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingCreate) => Promise<void>;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
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
  tables,
  loading = false,
}) => {
  const { t } = useTranslation();
  
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
    party_size: 2,
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
    const end = new Date(start.getTime() + serviceDurationMinutes * 60000);
    return end.toISOString();
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('customer.')) {
      const customerField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customer: { ...prev.customer, [customerField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
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

    if (formData.customer.email && !/\S+@\S+\.\S+/.test(formData.customer.email)) {
      newErrors['customer.email'] = t('booking.create.errors.emailInvalid');
    }

    if (formData.customer.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.customer.phone)) {
      newErrors['customer.phone'] = t('booking.create.errors.phoneInvalid');
    }

    // Booking validation
    if (formData.party_size < 1) {
      newErrors['party_size'] = t('booking.create.errors.partySizeRequired');
    }

    if (!formData.date) {
      newErrors['date'] = t('booking.create.errors.dateRequired');
    }

    if (!formData.time) {
      newErrors['time'] = t('booking.create.errors.timeRequired');
    }

    if (!formData.table_id) {
      newErrors['table_id'] = t('booking.create.errors.tableRequired');
    }

    // Check if date/time is in the future
    if (formData.date && formData.time) {
      const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
      if (bookingDateTime <= new Date()) {
        newErrors['datetime'] = t('booking.create.errors.pastDateTime');
      }
    }

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
      
      const starts_at = `${formData.date}T${formData.time}`;
      const ends_at = calculateEndTime(starts_at);

      const bookingData: BookingCreate = {
        service_id: serviceId,
        table_id: formData.table_id,
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
      setErrors({ submit: error.message || t('booking.create.errors.submitFailed') });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer: { name: '', phone: '', email: '' },
      party_size: 2,
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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('booking.create.title')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
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

            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-medium text-gray-900">
                  {t('booking.create.sections.customer')}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Table Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RectangleGroupIcon className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-medium text-gray-900">
                  {t('booking.create.sections.tableSelection')}
                </h4>
              </div>

              {availableTables.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    {t('booking.create.noTablesAvailable').replace('{partySize}', formData.party_size.toString())}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      {t('booking.create.estimatedEndTime').replace('{endTime}', new Date(calculateEndTime(`${formData.date}T${formData.time}`)).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('booking.create.actions.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || loading || availableTables.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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