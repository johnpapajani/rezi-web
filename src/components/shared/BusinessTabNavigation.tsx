import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

type TabType = 'dashboard' | 'settings' | 'services' | 'tables' | 'bookings' | 'calendar';

interface BusinessTabNavigationProps {
  bizId: string;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BusinessTabNavigation: React.FC<BusinessTabNavigationProps> = ({
  bizId,
  currentTab,
  onTabChange
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
    // Update URL without full navigation
    const newPath = tab === 'dashboard' 
      ? `/business/${bizId}` 
      : `/business/${bizId}/${tab}`;
    navigate(newPath, { replace: true });
  };

  return (
    <div className="mt-4 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            currentTab === 'dashboard'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {t('business.dashboard.tabs.dashboard')}
        </button>
        <button
          onClick={() => handleTabClick('settings')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            currentTab === 'settings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {t('business.dashboard.tabs.settings')}
        </button>
        <button
          onClick={() => handleTabClick('services')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            currentTab === 'services'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {t('business.dashboard.tabs.services')}
        </button>
        <button
          onClick={() => handleTabClick('tables')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            currentTab === 'tables'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {t('business.dashboard.tabs.tables')}
        </button>
        <button
          onClick={() => handleTabClick('bookings')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            currentTab === 'bookings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {t('business.dashboard.tabs.bookings')}
        </button>
        <button
          onClick={() => handleTabClick('calendar')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            currentTab === 'calendar'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {t('business.dashboard.tabs.calendar')}
        </button>
      </nav>
    </div>
  );
};

export default BusinessTabNavigation; 