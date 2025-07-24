import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useResources } from '../../hooks/useResources';
import { useResourceStats } from '../../hooks/useResourceStats';
import { useBusiness } from '../../hooks/useBusiness';
import MobileOptimizedHeader from '../shared/MobileOptimizedHeader';
import { 
  RectangleGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ResourceManagement: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { business, loading: businessLoading } = useBusiness({ bizId: bizId! });
  const { 
    resources, 
    loading: resourcesLoading, 
    error: resourcesError
  } = useResources({ bizId: bizId! });
  
  const { 
    stats, 
    loading: statsLoading, 
    error: statsError 
  } = useResourceStats({ bizId: bizId!, resources });

  const getStatsForResource = (resourceId: string) => {
    return stats.find(stat => stat.resourceId === resourceId) || {
      todayCount: 0,
      thisWeekCount: 0,
      thisMonthCount: 0
    };
  };

  if (businessLoading || resourcesLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileOptimizedHeader
        title={t('resources.dashboard.title')}
        subtitle={business?.name}
        backUrl={`/business/${bizId}`}
        icon={RectangleGroupIcon}
        variant="business"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {(resourcesError || statsError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">
                Error: {resourcesError || statsError}
              </span>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Resources Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {t('resources.dashboard.overview')} ({resources.length})
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('resources.dashboard.subtitle')}
              </p>
            </div>

            {resources.length === 0 ? (
              <div className="text-center py-12">
                <RectangleGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('resources.noResources')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('resources.dashboard.noResourcesDescription')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {resources.map((resource) => {
                  const resourceStats = getStatsForResource(resource.id);
                  
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Resource Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${resource.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <h3 className="text-lg font-semibold text-gray-900">{resource.code}</h3>
                        </div>
                        <div className="text-sm text-gray-500">
                          {resource.seats} {t('resources.seatsLabel')}
                        </div>
                      </div>

                      {/* Resource Stats */}
                      <div className="space-y-4">
                        {/* Today's Reservations */}
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-2">
                            <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              {t('resources.dashboard.today')}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            {statsLoading ? (
                              <div className="animate-pulse bg-blue-200 h-6 w-8 rounded"></div>
                            ) : (
                              resourceStats.todayCount
                            )}
                          </div>
                        </div>

                        {/* This Week's Reservations */}
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              {t('resources.dashboard.thisWeek')}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            {statsLoading ? (
                              <div className="animate-pulse bg-green-200 h-6 w-8 rounded"></div>
                            ) : (
                              resourceStats.thisWeekCount
                            )}
                          </div>
                        </div>

                        {/* This Month's Reservations */}
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-center space-x-2">
                            <ChartBarIcon className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">
                              {t('resources.dashboard.thisMonth')}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-purple-600">
                            {statsLoading ? (
                              <div className="animate-pulse bg-purple-200 h-6 w-8 rounded"></div>
                            ) : (
                              resourceStats.thisMonthCount
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Resource Details */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{t('resources.status')}:</span>
                          <span className={`font-medium ${resource.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                            {resource.is_active ? t('resources.statusActive') : t('resources.statusInactive')}
                          </span>
                        </div>
                        {resource.merge_group && (
                          <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                            <span>{t('resources.mergeGroupLabel')}</span>
                            <span className="font-medium">{resource.merge_group}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResourceManagement; 