import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ChevronDownIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

interface HeaderAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}

interface TabItem {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

interface MobileOptimizedHeaderProps {
  title: string;
  subtitle?: string;
  businessName?: string;
  backUrl?: string;
  onBack?: () => void;
  icon?: React.ComponentType<any>;
  logoUrl?: string;
  actions?: HeaderAction[];
  tabs?: TabItem[];
  showLanguageSelector?: boolean;
  className?: string;
  variant?: 'default' | 'business' | 'public';
}

const MobileOptimizedHeader: React.FC<MobileOptimizedHeaderProps> = ({
  title,
  subtitle,
  businessName,
  backUrl,
  onBack,
  icon: Icon,
  logoUrl,
  actions = [],
  tabs = [],
  showLanguageSelector = true,
  className = '',
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (tabScrollRef.current && tabs.length > 0) {
      const activeTabIndex = tabs.findIndex(tab => tab.isActive);
      if (activeTabIndex !== -1) {
        const activeButton = tabScrollRef.current.querySelector(`[data-tab-index="${activeTabIndex}"]`) as HTMLElement;
        if (activeButton) {
          const container = tabScrollRef.current;
          const containerWidth = container.offsetWidth;
          const buttonLeft = activeButton.offsetLeft;
          const buttonWidth = activeButton.offsetWidth;
          
          // Calculate scroll position to center the active tab
          const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
          
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [tabs]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const headerVariants = {
    default: 'bg-white shadow-sm border-b border-gray-200',
    business: 'bg-white shadow-sm border-b border-gray-200',
    public: 'bg-white/90 backdrop-blur-sm border-b border-gray-200/50'
  };

  const primaryAction = actions.find(action => action.variant === 'primary');
  const secondaryActions = actions.filter(action => action.variant !== 'primary');
  
  // Debug logging
  console.log('🎯 MOBILE HEADER DEBUG:', {
    actionsReceived: actions.length,
    primaryAction: !!primaryAction,
    primaryActionLabel: primaryAction?.label,
    secondaryActions: secondaryActions.length
  });

  return (
    <header className={`${headerVariants[variant]} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Main Header Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between min-h-[3rem]">
            {/* Left Section - Back Button + Title */}
            <div className="flex items-center min-w-0 flex-1">
              {/* Back Button */}
              {(backUrl || onBack) && (
                <button
                  onClick={handleBack}
                  className="flex-shrink-0 p-2 mr-2 sm:mr-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              )}

              {/* Logo/Icon + Title Section */}
              <div className="flex items-center min-w-0 flex-1">
                {/* Logo or Icon */}
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0 mr-3"
                  />
                ) : Icon ? (
                  <div className="flex-shrink-0 p-1 sm:p-2 mr-3">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                ) : null}

                {/* Title and Subtitle */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                      {title}
                    </h1>
                    {businessName && (
                      <span className="text-sm text-gray-500 truncate hidden sm:inline">
                        • {businessName}
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-sm text-gray-600 truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                  {businessName && (
                    <p className="text-xs text-gray-500 truncate mt-0.5 sm:hidden">
                      {businessName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section - Actions + Language */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Primary Action (always visible) */}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation font-medium"
                  style={{ minHeight: '44px' }}
                >
                  {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{primaryAction.label}</span>
                </button>
              )}

              {/* Language Selector */}
              {showLanguageSelector && (
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <div className="flex items-center space-x-1">
                      <GlobeAltIcon className="w-5 h-5" />
                      <span className="text-sm">
                        {languages.find(lang => lang.code === currentLanguage)?.flag}
                      </span>
                      <ChevronDownIcon className="w-3 h-3" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isLanguageOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => {
                              setLanguage(language.code);
                              setIsLanguageOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                              currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Menu Button (when there are secondary actions) */}
              {(secondaryActions.length > 0 || primaryAction) && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="w-5 h-5" />
                  ) : (
                    <Bars3Icon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Desktop Secondary Actions */}
              {secondaryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Actions Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (actions.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden border-t border-gray-200 pt-3 mt-3 space-y-2 relative z-50"
              >
                {primaryAction && (
                  <button
                    onClick={() => {
                      primaryAction.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={primaryAction.disabled}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation"
                  >
                    {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                    <span>{primaryAction.label}</span>
                  </button>
                )}
                {secondaryActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={action.disabled}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation"
                  >
                    {action.icon && <action.icon className="w-4 h-4" />}
                    <span>{action.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs Section */}
        {tabs.length > 0 && (
          <div className="border-t border-gray-200">
            {/* Mobile Tab Slider */}
            <div className="sm:hidden relative">
              {/* Scrollable tab container */}
              <div 
                ref={tabScrollRef}
                className="overflow-x-auto scrollbar-hide tab-scroll-smooth"
              >
                <nav className="flex min-w-full px-4 py-3">
                  <div className="flex space-x-2 min-w-max">
                    {tabs.map((tab, index) => (
                      <button
                        key={tab.id}
                        data-tab-index={index}
                        onClick={tab.onClick}
                        className={`
                          flex-shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 touch-manipulation
                          ${tab.isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-0'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
                          }
                        `}
                        style={{ 
                          minHeight: '44px',
                          minWidth: '80px'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
                <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300" style={{
                  width: `${tabs.length > 0 ? (100 / tabs.length) : 0}%`,
                  transform: `translateX(${tabs.findIndex(tab => tab.isActive) * 100}%)`
                }} />
              </div>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden sm:flex space-x-8 px-4 sm:px-6 lg:px-8 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={tab.onClick}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileOptimizedHeader; 