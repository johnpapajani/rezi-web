import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useServiceOpenIntervals } from '../../hooks/useServiceOpenIntervals';
import { ServiceOpenIntervalCreate, Weekday } from '../../types';
import { 
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface ServiceAvailabilityManagementProps {
  serviceId: string;
  serviceName: string;
}

const ServiceAvailabilityManagement: React.FC<ServiceAvailabilityManagementProps> = ({ 
  serviceId, 
  serviceName 
}) => {
  const { t } = useTranslation();
  
  const { 
    intervals, 
    loading: intervalsLoading, 
    error: intervalsError, 
    updating, 
    updateIntervals 
  } = useServiceOpenIntervals({ serviceId });

  const [formIntervals, setFormIntervals] = useState<ServiceOpenIntervalCreate[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    if (intervals) {
      setFormIntervals([...intervals]);
      setHasChanges(false);
    }
  }, [intervals]);

  const handleAddInterval = () => {
    const newInterval: ServiceOpenIntervalCreate = {
      weekday: Weekday.monday,
      start_time: '09:00',
      end_time: '17:00',
      notes: '',
    };
    setFormIntervals(prev => [...prev, newInterval]);
    setHasChanges(true);
  };

  const handleRemoveInterval = (index: number) => {
    setFormIntervals(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleIntervalChange = (index: number, field: keyof ServiceOpenIntervalCreate, value: any) => {
    setFormIntervals(prev => prev.map((interval, i) => 
      i === index ? { ...interval, [field]: value } : interval
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateIntervals(formIntervals);
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
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
    setHasChanges(true);
  };

  if (intervalsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (intervalsError) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.error')}</h3>
        <p className="text-red-600">{intervalsError}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('serviceOpenIntervals.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {serviceName}
            </p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={updating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('serviceOpenIntervals.saving')}
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {t('serviceOpenIntervals.save')}
                </>
              )}
            </button>
          )}
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
          >
            <CheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-green-800 text-sm font-medium">
              {t('serviceOpenIntervals.save')} {t('common.success').toLowerCase()}!
            </span>
          </motion.div>
        )}

        {/* Quick Setup */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">{t('serviceOpenIntervals.quickSetup')}</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickSetup('weekdays')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              {t('serviceOpenIntervals.weekdaysOnly')}
            </button>
            <button
              onClick={() => handleQuickSetup('weekends')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              {t('serviceOpenIntervals.weekendsOnly')}
            </button>
            <button
              onClick={() => handleQuickSetup('daily')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              {t('serviceOpenIntervals.allDays')}
            </button>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('serviceOpenIntervals.operatingHours')}</h3>
          <button
            onClick={handleAddInterval}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('serviceOpenIntervals.addInterval')}
          </button>
        </div>

        {formIntervals.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('serviceOpenIntervals.noIntervals')}</h3>
            <p className="text-gray-600 mb-4">{t('serviceOpenIntervals.noIntervalsDescription')}</p>
            <button
              onClick={handleAddInterval}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {t('serviceOpenIntervals.addInterval')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {formIntervals.map((interval, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('serviceOpenIntervals.weekday')}
                  </label>
                                     <select
                     value={interval.weekday}
                     onChange={(e) => handleIntervalChange(index, 'weekday', e.target.value as unknown as Weekday)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                    {weekdayOptions.map((option) => (
                      <option key={option.weekday} value={option.weekday}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('serviceOpenIntervals.startTime')}
                  </label>
                  <input
                    type="time"
                    value={interval.start_time}
                    onChange={(e) => handleIntervalChange(index, 'start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('serviceOpenIntervals.endTime')}
                  </label>
                  <input
                    type="time"
                    value={interval.end_time}
                    onChange={(e) => handleIntervalChange(index, 'end_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('serviceOpenIntervals.notes')}
                  </label>
                  <input
                    type="text"
                    value={interval.notes || ''}
                    onChange={(e) => handleIntervalChange(index, 'notes', e.target.value)}
                    placeholder={t('serviceOpenIntervals.notesPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => handleRemoveInterval(index)}
                    className="w-full px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">{t('serviceOpenIntervals.infoTitle')}</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('serviceOpenIntervals.info1')}</li>
              <li>• {t('serviceOpenIntervals.info2')}</li>
              <li>• {t('serviceOpenIntervals.info3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceAvailabilityManagement; 