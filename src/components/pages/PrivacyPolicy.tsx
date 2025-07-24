import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const PrivacyPolicy: React.FC = () => {
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
                {t('privacy.title')}
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
              {t('privacy.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('privacy.lastUpdated')}: {t('privacy.updateDate')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.introduction.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('privacy.introduction.description')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.introduction.commitment')}
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.dataCollection.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('privacy.dataCollection.personalInfo.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('privacy.dataCollection.personalInfo.name')}</li>
                      <li>{t('privacy.dataCollection.personalInfo.email')}</li>
                      <li>{t('privacy.dataCollection.personalInfo.phone')}</li>
                      <li>{t('privacy.dataCollection.personalInfo.business')}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('privacy.dataCollection.businessInfo.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('privacy.dataCollection.businessInfo.details')}</li>
                      <li>{t('privacy.dataCollection.businessInfo.services')}</li>
                      <li>{t('privacy.dataCollection.businessInfo.bookings')}</li>
                      <li>{t('privacy.dataCollection.businessInfo.customers')}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('privacy.dataCollection.technicalInfo.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('privacy.dataCollection.technicalInfo.ip')}</li>
                      <li>{t('privacy.dataCollection.technicalInfo.browser')}</li>
                      <li>{t('privacy.dataCollection.technicalInfo.device')}</li>
                      <li>{t('privacy.dataCollection.technicalInfo.usage')}</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.dataUsage.title')}
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('privacy.dataUsage.provide')}</li>
                  <li>{t('privacy.dataUsage.improve')}</li>
                  <li>{t('privacy.dataUsage.communicate')}</li>
                  <li>{t('privacy.dataUsage.support')}</li>
                  <li>{t('privacy.dataUsage.legal')}</li>
                  <li>{t('privacy.dataUsage.marketing')}</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.dataSharing.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('privacy.dataSharing.description')}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('privacy.dataSharing.consent')}</li>
                  <li>{t('privacy.dataSharing.legal')}</li>
                  <li>{t('privacy.dataSharing.service')}</li>
                  <li>{t('privacy.dataSharing.business')}</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.dataSecurity.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('privacy.dataSecurity.description')}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('privacy.dataSecurity.encryption')}</li>
                  <li>{t('privacy.dataSecurity.access')}</li>
                  <li>{t('privacy.dataSecurity.monitoring')}</li>
                  <li>{t('privacy.dataSecurity.backup')}</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.userRights.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('privacy.userRights.description')}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('privacy.userRights.access')}</li>
                  <li>{t('privacy.userRights.correct')}</li>
                  <li>{t('privacy.userRights.delete')}</li>
                  <li>{t('privacy.userRights.restrict')}</li>
                  <li>{t('privacy.userRights.portability')}</li>
                  <li>{t('privacy.userRights.object')}</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.cookies.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('privacy.cookies.description')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.cookies.more')} <Link to="/cookies" className="text-blue-600 hover:text-blue-700 underline">{t('privacy.cookies.policy')}</Link>.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.dataRetention.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.dataRetention.description')}
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.internationalTransfers.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.internationalTransfers.description')}
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.policyChanges.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('privacy.policyChanges.description')}
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('privacy.contact.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('privacy.contact.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">{t('privacy.contact.info')}</h3>
                  <p className="text-gray-700">
                    Email: <a href="mailto:privacy@restorezi.com" className="text-blue-600 hover:text-blue-700">privacy@restorezi.com</a>
                  </p>
                  <p className="text-gray-700">
                    {t('privacy.contact.address')}: Tiranë, Shqipëri
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

export default PrivacyPolicy; 