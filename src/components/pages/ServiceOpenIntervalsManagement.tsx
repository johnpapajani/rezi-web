import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useServiceOpenIntervals } from '../../hooks/useServiceOpenIntervals';
import { serviceApi } from '../../utils/api';
import { ServiceWithOpenIntervals, ServiceOpenIntervalCreate, Weekday } from '../../types';
import MobileOptimizedHeader from '../shared/MobileOptimizedHeader';
import { 
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const ServiceOpenIntervalsManagement: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [service, setService] = useState<ServiceWithOpenIntervals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    intervals, 
    loading: intervalsLoading, 
    error: intervalsError, 
    updating, 
    updateIntervals 
  } = useServiceOpenIntervals({ serviceId: serviceId! });

  const [formIntervals, setFormIntervals] = useState<ServiceOpenIntervalCreate[]>([]);

  const weekdayOptions = [
    { weekday: Weekday.monday, name: t('days.monday'), short: t('days.short.monday') },
    { weekday: Weekday.tuesday, name: t('days.tuesday'), short: t('days.short.tuesday') },
    { weekday: Weekday.wednesday, name: t('days.wednesday'), short: t('days.short.wednesday') },
    { weekday: Weekday.thursday, name: t('days.thursday'), short: t('days.short.thursday') },
    { weekday: Weekday.friday, name: t('days.friday'), short: t('days.short.friday') },
    { weekday: Weekday.saturday, name: t('days.saturday'), short: t('days.short.saturday') },
    { weekday: Weekday.sunday, name: t('days.sunday'), short: t('days.short.sunday') },
  ];

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  useEffect(() => {
    if (intervals) {
      setFormIntervals([...intervals]);
    }
  }, [intervals]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const serviceData = await serviceApi.getServiceDetails(serviceId!);
      setService(serviceData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch service data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterval = () => {
    const newInterval: ServiceOpenIntervalCreate = {
      weekday: Weekday.monday,
      start_time: '09:00',
      end_time: '17:00',
      notes: '',
    };
    setFormIntervals(prev => [...prev, newInterval]);
  };

  const handleRemoveInterval = (index: number) => {
    setFormIntervals(prev => prev.filter((_, i) => i !== index));
  };

  const handleIntervalChange = (index: number, field: keyof ServiceOpenIntervalCreate, value: any) => {
    setFormIntervals(prev => prev.map((interval, i) => 
      i === index ? { ...interval, [field]: value } : interval
    ));
  };

  const getBackUrl = () => {
    // If we have business slug, prefer business-centric navigation
    if (service?.business_slug) {
      return `/business/${service.business_id}/services`;
    }
    // Otherwise, fall back to service dashboard
    return `/service/${serviceId}`;
  };

  const handleSave = async () => {
    try {
      await updateIntervals(formIntervals);
      navigate(getBackUrl());
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleQuickSetup = (preset: 'weekdays' | 'weekends' | 'daily') => {
    const baseHours = { start_time: '09:00', end_time: '17:00', notes: '' };
    
    switch (preset) {
      case 'weekdays':
        setFormIntervals([
          { weekday: Weekday.monday, ...baseHours },
          { weekday: Weekday.tuesday, ...baseHours },
          { weekday: Weekday.wednesday, ...baseHours },
          { weekday: Weekday.thursday, ...baseHours },
          { weekday: Weekday.friday, ...baseHours },
        ]);
        break;
      case 'weekends':
        setFormIntervals([
          { weekday: Weekday.saturday, ...baseHours },
          { weekday: Weekday.sunday, ...baseHours },
        ]);
        break;
      case 'daily':
        setFormIntervals(weekdayOptions.map(day => ({ weekday: day.weekday, ...baseHours })));
        break;
    }
  };

  if (loading || intervalsLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error || intervalsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Service</h2>
          <p className="text-red-600 mb-4">{error || intervalsError}</p>
          <button
            onClick={() => navigate(`/service/${serviceId}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileOptimizedHeader
        title={t('serviceOpenIntervals.title')}
        subtitle={service?.name}
        backUrl={getBackUrl()}
        icon={ClockIcon}
        variant="business"
        actions={[
          {
            label: updating ? t('serviceOpenIntervals.saving') : t('serviceOpenIntervals.save'),
            onClick: handleSave,
            variant: 'primary',
            disabled: updating
          }
        ]}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Quick Setup */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {t('serviceOpenIntervals.quickSetup')}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleQuickSetup('weekdays')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('serviceOpenIntervals.weekdaysOnly')}
              </button>
              <button
                onClick={() => handleQuickSetup('weekends')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('serviceOpenIntervals.weekendsOnly')}
              </button>
              <button
                onClick={() => handleQuickSetup('daily')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('serviceOpenIntervals.allDays')}
              </button>
            </div>
          </div>

          {/* Open Intervals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {t('serviceOpenIntervals.operatingHours')}
              </h2>
              <button
                onClick={handleAddInterval}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {t('serviceOpenIntervals.addInterval')}
              </button>
            </div>

            {formIntervals.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('serviceOpenIntervals.noIntervals')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('serviceOpenIntervals.noIntervalsDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formIntervals.map((interval, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('serviceOpenIntervals.weekday')}
                      </label>
                      <select
                        value={interval.weekday}
                        onChange={(e) => handleIntervalChange(index, 'weekday', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {weekdayOptions.map((day) => (
                          <option key={day.weekday} value={day.weekday}>
                            {day.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('serviceOpenIntervals.startTime')}
                      </label>
                      <input
                        type="time"
                        value={interval.start_time}
                        onChange={(e) => handleIntervalChange(index, 'start_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('serviceOpenIntervals.endTime')}
                      </label>
                      <input
                        type="time"
                        value={interval.end_time}
                        onChange={(e) => handleIntervalChange(index, 'end_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('serviceOpenIntervals.notes')}
                      </label>
                      <input
                        type="text"
                        value={interval.notes || ''}
                        onChange={(e) => handleIntervalChange(index, 'notes', e.target.value)}
                        placeholder={t('serviceOpenIntervals.notesPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleRemoveInterval(index)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{t('serviceOpenIntervals.infoTitle')}</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{t('serviceOpenIntervals.info1')}</li>
                  <li>{t('serviceOpenIntervals.info2')}</li>
                  <li>{t('serviceOpenIntervals.info3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ServiceOpenIntervalsManagement; 