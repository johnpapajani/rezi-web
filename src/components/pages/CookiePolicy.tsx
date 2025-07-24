import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const CookiePolicy: React.FC = () => {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                {t('cookies.title')}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-8 md:p-12"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('cookies.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('cookies.lastUpdated')}: {t('cookies.updateDate')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.introduction.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('cookies.introduction.description')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('cookies.introduction.commitment')}
                </p>
              </section>

              {/* What are Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.whatAreCookies.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('cookies.whatAreCookies.description')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('cookies.whatAreCookies.purpose')}
                </p>
              </section>

              {/* Types of Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.typesOfCookies.title')}
                </h2>
                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t('cookies.typesOfCookies.essential.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {t('cookies.typesOfCookies.essential.description')}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('cookies.typesOfCookies.essential.authentication')}</li>
                      <li>{t('cookies.typesOfCookies.essential.security')}</li>
                      <li>{t('cookies.typesOfCookies.essential.language')}</li>
                      <li>{t('cookies.typesOfCookies.essential.session')}</li>
                    </ul>
                  </div>

                  {/* Functional Cookies */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t('cookies.typesOfCookies.functional.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {t('cookies.typesOfCookies.functional.description')}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('cookies.typesOfCookies.functional.preferences')}</li>
                      <li>{t('cookies.typesOfCookies.functional.settings')}</li>
                      <li>{t('cookies.typesOfCookies.functional.features')}</li>
                    </ul>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t('cookies.typesOfCookies.analytics.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {t('cookies.typesOfCookies.analytics.description')}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('cookies.typesOfCookies.analytics.usage')}</li>
                      <li>{t('cookies.typesOfCookies.analytics.performance')}</li>
                      <li>{t('cookies.typesOfCookies.analytics.errors')}</li>
                      <li>{t('cookies.typesOfCookies.analytics.trends')}</li>
                    </ul>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t('cookies.typesOfCookies.marketing.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {t('cookies.typesOfCookies.marketing.description')}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('cookies.typesOfCookies.marketing.advertising')}</li>
                      <li>{t('cookies.typesOfCookies.marketing.tracking')}</li>
                      <li>{t('cookies.typesOfCookies.marketing.remarketing')}</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Specific Cookies We Use */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.specificCookies.title')}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                          {t('cookies.specificCookies.table.name')}
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                          {t('cookies.specificCookies.table.purpose')}
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                          {t('cookies.specificCookies.table.duration')}
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                          {t('cookies.specificCookies.table.type')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">rezi_session</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.sessionPurpose')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.sessionDuration')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.essential')}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">rezi_language</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.languagePurpose')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.languageDuration')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.functional')}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">rezi_preferences</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.preferencesPurpose')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.preferencesDuration')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.functional')}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-mono text-sm">_ga</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.analyticsPurpose')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.analyticsDuration')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{t('cookies.specificCookies.table.analytics')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.thirdParty.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('cookies.thirdParty.description')}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Google Analytics:</strong> {t('cookies.thirdParty.googleAnalytics')}</li>
                  <li><strong>Stripe:</strong> {t('cookies.thirdParty.stripe')}</li>
                  <li><strong>Intercom:</strong> {t('cookies.thirdParty.intercom')}</li>
                </ul>
              </section>

              {/* Managing Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.managing.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('cookies.managing.browser.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {t('cookies.managing.browser.description')}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Google Chrome</a></li>
                      <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Mozilla Firefox</a></li>
                      <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Safari</a></li>
                      <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Microsoft Edge</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('cookies.managing.consequences.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('cookies.managing.consequences.description')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookie Consent */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.consent.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('cookies.consent.description')}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('cookies.consent.essential')}</li>
                  <li>{t('cookies.consent.functional')}</li>
                  <li>{t('cookies.consent.analytics')}</li>
                  <li>{t('cookies.consent.marketing')}</li>
                </ul>
              </section>

              {/* Updates to Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.updates.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('cookies.updates.description')}
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('cookies.contact.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('cookies.contact.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">{t('cookies.contact.info')}</h3>
                  <p className="text-gray-700">
                    Email: <a href="mailto:privacy@restorezi.com" className="text-blue-600 hover:text-blue-700">privacy@restorezi.com</a>
                  </p>
                  <p className="text-gray-700">
                    {t('cookies.contact.address')}: Tiranë, Shqipëri
                  </p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CookiePolicy; 