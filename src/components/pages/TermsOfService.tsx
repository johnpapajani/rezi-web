import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const TermsOfService: React.FC = () => {
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
                {t('terms.title')}
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
              {t('terms.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('terms.lastUpdated')}: {t('terms.updateDate')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.introduction.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('terms.introduction.description')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.introduction.agreement')}
                </p>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.serviceDescription.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('terms.serviceDescription.description')}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('terms.serviceDescription.reservations')}</li>
                  <li>{t('terms.serviceDescription.calendar')}</li>
                  <li>{t('terms.serviceDescription.notifications')}</li>
                  <li>{t('terms.serviceDescription.analytics')}</li>
                  <li>{t('terms.serviceDescription.qr')}</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.userAccounts.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.userAccounts.registration.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('terms.userAccounts.registration.accurate')}</li>
                      <li>{t('terms.userAccounts.registration.update')}</li>
                      <li>{t('terms.userAccounts.registration.secure')}</li>
                      <li>{t('terms.userAccounts.registration.responsible')}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.userAccounts.business.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('terms.userAccounts.business.legitimate')}</li>
                      <li>{t('terms.userAccounts.business.authorized')}</li>
                      <li>{t('terms.userAccounts.business.compliance')}</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Use of Service */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.useOfService.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.useOfService.permitted.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('terms.useOfService.permitted.manage')}</li>
                      <li>{t('terms.useOfService.permitted.accept')}</li>
                      <li>{t('terms.useOfService.permitted.communicate')}</li>
                      <li>{t('terms.useOfService.permitted.data')}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.useOfService.prohibited.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('terms.useOfService.prohibited.illegal')}</li>
                      <li>{t('terms.useOfService.prohibited.harm')}</li>
                      <li>{t('terms.useOfService.prohibited.spam')}</li>
                      <li>{t('terms.useOfService.prohibited.interference')}</li>
                      <li>{t('terms.useOfService.prohibited.abuse')}</li>
                      <li>{t('terms.useOfService.prohibited.impersonation')}</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.payment.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.payment.pricing.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('terms.payment.pricing.plans')}</li>
                      <li>{t('terms.payment.pricing.changes')}</li>
                      <li>{t('terms.payment.pricing.notice')}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.payment.billing.title')}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>{t('terms.payment.billing.automatic')}</li>
                      <li>{t('terms.payment.billing.failure')}</li>
                      <li>{t('terms.payment.billing.refunds')}</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data and Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.dataPrivacy.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('terms.dataPrivacy.description')}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.dataPrivacy.policy')} <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">{t('terms.dataPrivacy.policyLink')}</Link>.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.intellectualProperty.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.intellectualProperty.ownership.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.intellectualProperty.ownership.description')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.intellectualProperty.license.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.intellectualProperty.license.description')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.intellectualProperty.userContent.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.intellectualProperty.userContent.description')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Service Availability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.serviceAvailability.title')}
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('terms.serviceAvailability.uptime')}</li>
                  <li>{t('terms.serviceAvailability.maintenance')}</li>
                  <li>{t('terms.serviceAvailability.interruptions')}</li>
                  <li>{t('terms.serviceAvailability.updates')}</li>
                </ul>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.liability.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('terms.liability.description')}
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t('terms.liability.indirect')}</li>
                  <li>{t('terms.liability.loss')}</li>
                  <li>{t('terms.liability.interruption')}</li>
                  <li>{t('terms.liability.thirdParty')}</li>
                </ul>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.indemnification.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.indemnification.description')}
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.termination.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.termination.byUser.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.termination.byUser.description')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.termination.byCompany.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.termination.byCompany.description')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('terms.termination.effects.title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('terms.termination.effects.description')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.governingLaw.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.governingLaw.description')}
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.changes.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('terms.changes.description')}
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t('terms.contact.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('terms.contact.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">{t('terms.contact.info')}</h3>
                  <p className="text-gray-700">
                    Email: <a href="mailto:legal@restorezi.com" className="text-blue-600 hover:text-blue-700">legal@restorezi.com</a>
                  </p>
                  <p className="text-gray-700">
                    {t('terms.contact.address')}: Tiranë, Shqipëri
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

export default TermsOfService; 