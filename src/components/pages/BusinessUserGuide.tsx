import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  UserPlusIcon,
  BuildingStorefrontIcon,
  CogIcon,
  RectangleGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HomeIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  GlobeAltIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface GuideSection {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  steps: GuideStep[];
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  details?: string[];
  image?: string;
  tip?: string;
}

const BusinessUserGuide: React.FC = () => {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>('account');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const guideSections: GuideSection[] = [
    {
      id: 'account',
      icon: UserPlusIcon,
      title: t('guide.sections.account.title'),
      description: t('guide.sections.account.description'),
      steps: [
        {
          id: 'signup',
          title: t('guide.account.signup.title'),
          description: t('guide.account.signup.description'),
          details: [
            t('guide.account.signup.step1'),
            t('guide.account.signup.step2'),
            t('guide.account.signup.step3'),
            t('guide.account.signup.step4')
          ],
          tip: t('guide.account.signup.tip')
        },
        {
          id: 'verify',
          title: t('guide.account.verify.title'),
          description: t('guide.account.verify.description'),
          details: [
            t('guide.account.verify.step1'),
            t('guide.account.verify.step2')
          ]
        }
      ]
    },
    {
      id: 'business',
      icon: BuildingStorefrontIcon,
      title: t('guide.sections.business.title'),
      description: t('guide.sections.business.description'),
      steps: [
        {
          id: 'basic-info',
          title: t('guide.business.basic.title'),
          description: t('guide.business.basic.description'),
          details: [
            t('guide.business.basic.step1'),
            t('guide.business.basic.step2'),
            t('guide.business.basic.step3'),
            t('guide.business.basic.step4'),
            t('guide.business.basic.step5')
          ],
          tip: t('guide.business.basic.tip')
        },
        {
          id: 'address',
          title: t('guide.business.address.title'),
          description: t('guide.business.address.description'),
          details: [
            t('guide.business.address.step1'),
            t('guide.business.address.step2'),
            t('guide.business.address.step3')
          ]
        },
        {
          id: 'settings',
          title: t('guide.business.settings.title'),
          description: t('guide.business.settings.description'),
          details: [
            t('guide.business.settings.step1'),
            t('guide.business.settings.step2'),
            t('guide.business.settings.step3')
          ]
        }
      ]
    },
    {
      id: 'services',
      icon: CogIcon,
      title: t('guide.sections.services.title'),
      description: t('guide.sections.services.description'),
      steps: [
        {
          id: 'create-service',
          title: t('guide.services.create.title'),
          description: t('guide.services.create.description'),
          details: [
            t('guide.services.create.step1'),
            t('guide.services.create.step2'),
            t('guide.services.create.step3'),
            t('guide.services.create.step4'),
            t('guide.services.create.step5'),
            t('guide.services.create.step6')
          ],
          tip: t('guide.services.create.tip')
        },
        {
          id: 'hours',
          title: t('guide.services.hours.title'),
          description: t('guide.services.hours.description'),
          details: [
            t('guide.services.hours.step1'),
            t('guide.services.hours.step2'),
            t('guide.services.hours.step3'),
            t('guide.services.hours.step4')
          ],
          tip: t('guide.services.hours.tip')
        },
        {
          id: 'pricing',
          title: t('guide.services.pricing.title'),
          description: t('guide.services.pricing.description'),
          details: [
            t('guide.services.pricing.step1'),
            t('guide.services.pricing.step2'),
            t('guide.services.pricing.step3')
          ]
        }
      ]
    },
    {
      id: 'tables',
      icon: RectangleGroupIcon,
      title: t('guide.sections.tables.title'),
      description: t('guide.sections.tables.description'),
      steps: [
        {
          id: 'add-tables',
          title: t('guide.tables.add.title'),
          description: t('guide.tables.add.description'),
          details: [
            t('guide.tables.add.step1'),
            t('guide.tables.add.step2'),
            t('guide.tables.add.step3'),
            t('guide.tables.add.step4'),
            t('guide.tables.add.step5')
          ],
          tip: t('guide.tables.add.tip')
        },
        {
          id: 'organize',
          title: t('guide.tables.organize.title'),
          description: t('guide.tables.organize.description'),
          details: [
            t('guide.tables.organize.step1'),
            t('guide.tables.organize.step2'),
            t('guide.tables.organize.step3')
          ]
        },
        {
          id: 'manage',
          title: t('guide.tables.manage.title'),
          description: t('guide.tables.manage.description'),
          details: [
            t('guide.tables.manage.step1'),
            t('guide.tables.manage.step2'),
            t('guide.tables.manage.step3')
          ]
        }
      ]
    },
    {
      id: 'bookings',
      icon: CalendarDaysIcon,
      title: t('guide.sections.bookings.title'),
      description: t('guide.sections.bookings.description'),
      steps: [
        {
          id: 'receive',
          title: t('guide.bookings.receive.title'),
          description: t('guide.bookings.receive.description'),
          details: [
            t('guide.bookings.receive.step1'),
            t('guide.bookings.receive.step2'),
            t('guide.bookings.receive.step3')
          ]
        },
        {
          id: 'manage',
          title: t('guide.bookings.manage.title'),
          description: t('guide.bookings.manage.description'),
          details: [
            t('guide.bookings.manage.step1'),
            t('guide.bookings.manage.step2'),
            t('guide.bookings.manage.step3'),
            t('guide.bookings.manage.step4')
          ]
        },
        {
          id: 'calendar',
          title: t('guide.bookings.calendar.title'),
          description: t('guide.bookings.calendar.description'),
          details: [
            t('guide.bookings.calendar.step1'),
            t('guide.bookings.calendar.step2'),
            t('guide.bookings.calendar.step3')
          ]
        }
      ]
    },
    {
      id: 'sharing',
      icon: QrCodeIcon,
      title: t('guide.sections.sharing.title'),
      description: t('guide.sections.sharing.description'),
      steps: [
        {
          id: 'qr-code',
          title: t('guide.sharing.qr.title'),
          description: t('guide.sharing.qr.description'),
          details: [
            t('guide.sharing.qr.step1'),
            t('guide.sharing.qr.step2'),
            t('guide.sharing.qr.step3'),
            t('guide.sharing.qr.step4')
          ],
          tip: t('guide.sharing.qr.tip')
        },
        {
          id: 'link',
          title: t('guide.sharing.link.title'),
          description: t('guide.sharing.link.description'),
          details: [
            t('guide.sharing.link.step1'),
            t('guide.sharing.link.step2'),
            t('guide.sharing.link.step3')
          ]
        },
        {
          id: 'promote',
          title: t('guide.sharing.promote.title'),
          description: t('guide.sharing.promote.description'),
          details: [
            t('guide.sharing.promote.step1'),
            t('guide.sharing.promote.step2'),
            t('guide.sharing.promote.step3'),
            t('guide.sharing.promote.step4')
          ]
        }
      ]
    },
    {
      id: 'analytics',
      icon: ChartBarIcon,
      title: t('guide.sections.analytics.title'),
      description: t('guide.sections.analytics.description'),
      steps: [
        {
          id: 'dashboard',
          title: t('guide.analytics.dashboard.title'),
          description: t('guide.analytics.dashboard.description'),
          details: [
            t('guide.analytics.dashboard.step1'),
            t('guide.analytics.dashboard.step2'),
            t('guide.analytics.dashboard.step3')
          ]
        },
        {
          id: 'reports',
          title: t('guide.analytics.reports.title'),
          description: t('guide.analytics.reports.description'),
          details: [
            t('guide.analytics.reports.step1'),
            t('guide.analytics.reports.step2'),
            t('guide.analytics.reports.step3')
          ]
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rezi
                </span>
              </Link>
              <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-gray-600">{t('guide.title')}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <GlobeAltIcon className="w-5 h-5" />
                  <span className="text-sm">
                    {languages.find(lang => lang.code === currentLanguage)?.flag}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
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

              {/* Home Button */}
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                {t('common.back')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('guide.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('guide.subtitle')}
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              {t('guide.quickActions.getStarted')}
            </Link>
            <a
              href="#account"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              {t('guide.quickActions.readGuide')}
            </a>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('guide.benefits.easy.title')}
              </h3>
              <p className="text-gray-600">
                {t('guide.benefits.easy.description')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('guide.benefits.online.title')}
              </h3>
              <p className="text-gray-600">
                {t('guide.benefits.online.description')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('guide.benefits.insights.title')}
              </h3>
              <p className="text-gray-600">
                {t('guide.benefits.insights.description')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('guide.tableOfContents')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {guideSections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <section.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {section.steps.length} {t('guide.steps')}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Guide Sections */}
        <div className="space-y-6">
          {guideSections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * sectionIndex }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <section.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="px-6 py-6">
                      <div className="space-y-8">
                        {section.steps.map((step, stepIndex) => (
                          <div key={step.id} className="relative">
                            {/* Step Number */}
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white text-sm font-bold">
                                  {stepIndex + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {step.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                  {step.description}
                                </p>
                                
                                {/* Step Details */}
                                {step.details && step.details.length > 0 && (
                                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                      {t('guide.detailedSteps')}:
                                    </h4>
                                    <ol className="space-y-2">
                                      {step.details.map((detail, detailIndex) => (
                                        <li key={detailIndex} className="flex items-start">
                                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-700">{detail}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}

                                {/* Step Tip */}
                                {step.tip && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                      <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <h4 className="font-medium text-blue-900 mb-1">
                                          {t('guide.tip')}
                                        </h4>
                                        <p className="text-blue-800">{step.tip}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Connector Line */}
                            {stepIndex < section.steps.length - 1 && (
                              <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('guide.footer.title')}
          </h2>
          <p className="text-lg mb-6 text-blue-100">
            {t('guide.footer.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              {t('guide.footer.getStarted')}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              {t('guide.footer.backToHome')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessUserGuide; 