import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const HelpPage: React.FC = () => {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'getting-started',
      icon: BookOpenIcon,
      color: 'blue'
    },
    {
      id: 'reservations',
      icon: QuestionMarkCircleIcon,
      color: 'green'
    },
    {
      id: 'account',
      icon: ChatBubbleLeftRightIcon,
      color: 'purple'
    },
    {
      id: 'technical',
      icon: PhoneIcon,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                {t('common.backToHome')}
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">
                {t('help.title')}
              </h1>
            </div>

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
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('help.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('help.hero.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('help.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t('help.categories.title')}
              </h2>
              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        selectedCategory === category.id 
                          ? getColorClasses(category.color)
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{t(`help.categories.${category.id}.title`)}</span>
                      </div>
                      <ChevronRightIcon className={`w-4 h-4 transition-transform ${
                        selectedCategory === category.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  );
                })}
              </nav>

              {/* Contact Support */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('help.support.title')}
                </h3>
                <div className="space-y-3">
                  <a
                    href="mailto:support@restorezi.com"
                    className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                    <span>{t('help.support.email')}</span>
                  </a>
                  <Link
                    to="/guide"
                    className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <BookOpenIcon className="w-5 h-5" />
                    <span>{t('help.support.guide')}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {!selectedCategory ? (
              /* Overview */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    {t('help.quickActions.title')}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link
                      to="/guide"
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <BookOpenIcon className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {t('help.quickActions.businessGuide')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('help.quickActions.businessGuideDesc')}
                        </p>
                      </div>
                    </Link>
                    <a
                      href="mailto:support@restorezi.com"
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
                    >
                      <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-green-600">
                          {t('help.quickActions.contactSupport')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('help.quickActions.contactSupportDesc')}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Popular Articles */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    {t('help.popularArticles.title')}
                  </h2>
                  <div className="space-y-4">
                    {['setup', 'reservations', 'qr', 'notifications', 'billing'].map((article) => (
                      <div key={article} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="font-medium text-gray-900">
                          {t(`help.popularArticles.${article}.title`)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {t(`help.popularArticles.${article}.description`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Category Content */
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-8"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {t(`help.categories.${selectedCategory}.title`)}
                </h2>
                <div className="space-y-6">
                  {/* FAQ Items for selected category */}
                  {[1, 2, 3, 4, 5].map((item) => (
                    <details key={item} className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-900">
                          {t(`help.categories.${selectedCategory}.faq.q${item}.question`)}
                        </span>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="mt-4 p-4 text-gray-700 leading-relaxed">
                        {t(`help.categories.${selectedCategory}.faq.q${item}.answer`)}
                      </div>
                    </details>
                  ))}
                </div>

                {/* Still need help */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {t('help.stillNeedHelp.title')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('help.stillNeedHelp.description')}
                  </p>
                  <a
                    href="mailto:support@restorezi.com"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    {t('help.stillNeedHelp.contact')}
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage; 