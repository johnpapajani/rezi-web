import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backTo,
  icon,
  actions,
  className = '',
  children,
}) => {
  const navigate = useNavigate();

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Section - Back button, Icon, Title */}
          <div className="flex items-center space-x-3 min-w-0">
            {backTo && (
              <button
                onClick={() => navigate(backTo)}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          {actions && (
            <div className="flex-shrink-0 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {actions}
              </div>
            </div>
          )}
        </div>

        {/* Additional content (like tabs) */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader; 