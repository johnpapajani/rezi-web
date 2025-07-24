import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUserBusinesses } from '../../hooks/useUserBusinesses';
import { BusinessRole } from '../../types';
import MobileOptimizedHeader from '../shared/MobileOptimizedHeader';
import {
  BuildingStorefrontIcon,
  PlusIcon,
  CogIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const BusinessList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { businesses, loading, error } = useUserBusinesses();

  // Helper function to get role display text
  const getRoleDisplayText = (role: BusinessRole): string => {
    switch (role) {
      case BusinessRole.owner:
        return t('business.roles.owner');
      case BusinessRole.manager:
        return t('business.roles.manager');
      case BusinessRole.employee:
        return t('business.roles.employee');
      default:
        return t('business.roles.member');
    }
  };

  // Helper function to get role color
  const getRoleColor = (role: BusinessRole): string => {
    switch (role) {
      case BusinessRole.owner:
        return 'text-purple-600 bg-purple-50';
      case BusinessRole.manager:
        return 'text-blue-600 bg-blue-50';
      case BusinessRole.employee:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('business.list.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.list.error.title')}</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.list.error.return')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileOptimizedHeader
        title={t('business.list.title')}
        subtitle={`${t('business.list.subtitle')} (${businesses.length})`}
        backUrl="/dashboard"
        icon={BuildingStorefrontIcon}
        variant="business"
        actions={[
          {
            label: t('business.list.addBusiness'),
            onClick: () => navigate('/business/create'),
            variant: 'primary',
            icon: PlusIcon
          }
        ]}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={business.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                                         <div>
                       <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                       <p className="text-sm text-gray-600">{business.city || t('business.list.noCitySpecified')}</p>
                       <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(business.role)}`}>
                         {getRoleDisplayText(business.role)}
                       </span>
                     </div>
                  </div>
                </div>

                                 <div className="flex items-center justify-between">
                   <div className="text-sm text-gray-600">
                     <span className="font-medium">{t('business.list.currency')}</span> {business.currency}
                   </div>
                   <button
                     onClick={() => navigate(`/business/${business.id}/select-service`)}
                     className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                   >
                     <CogIcon className="w-4 h-4" />
                     <span className="text-sm font-medium">{t('business.list.manage')}</span>
                   </button>
                 </div>
              </motion.div>
            ))}

            {/* Add Business Card */}
                         <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-blue-300 transition-colors cursor-pointer flex flex-col items-center justify-center text-center"
               onClick={() => navigate('/business/create')}
             >
                             <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                 <PlusIcon className="w-6 h-6 text-gray-600" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">{t('business.list.addNew.title')}</h3>
               <p className="text-sm text-gray-600">{t('business.list.addNew.description')}</p>
            </motion.div>
          </div>

          {businesses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
                             <BuildingStorefrontIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
               <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('business.list.empty.title')}</h3>
               <p className="text-gray-600 mb-6">{t('business.list.empty.description')}</p>
               <button
                 onClick={() => navigate('/business/create')}
                 className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
               >
                 <PlusIcon className="w-5 h-5" />
                 <span>{t('business.list.empty.cta')}</span>
               </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessList; 