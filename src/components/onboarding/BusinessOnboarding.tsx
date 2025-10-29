import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBusinessCreate } from '../../hooks/useBusinessCreate';
import { useTranslation } from '../../hooks/useTranslation';
import { BusinessCreate } from '../../types';
import {
  BuildingStorefrontIcon,
  PhotoIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Albanian cities list
const ALBANIAN_CITIES = [
  'Tirana',
  'Durrës',
  'Vlorë',
  'Elbasan',
  'Shkodër',
  'Fier',
  'Korçë',
  'Berat',
  'Lushnjë',
  'Kavajë',
  'Gjirokastër',
  'Sarandë',
  'Laç',
  'Kukës',
  'Lezhë',
  'Pogradec',
  'Krujë',
  'Peshkopi',
  'Burrel',
  'Çorovodë',
  'Ersekë',
  'Gramsh',
  'Librazhd',
  'Lushnjë',
  'Maliq',
  'Memaliaj',
  'Orikum',
  'Patos',
  'Peqin',
  'Përmet',
  'Përrenjas',
  'Pukë',
  'Roskovec',
  'Rrogozhinë',
  'Rubik',
  'Selenicë',
  'Shijak',
  'Tepelenë',
  'Ura Vajgurore',
  'Vau i Dejës',
  'Vorë',
];

const BusinessOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { creating: creatingBusiness, error: businessError, createBusiness, clearError } = useBusinessCreate();

  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Step 1: Business Information
  const [businessData, setBusinessData] = useState<BusinessCreate>({
    name: '',
    slug: '',
    currency: 'EUR',
    timezone: 'Europe/Tirane',
    logo_url: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country_code: 'AL',
  });

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Generate slug from business name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const containerWidthClass = 'max-w-4xl';

  const validateBusinessStep = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!businessData.name.trim()) {
      errors.name = t('business.create.validation.nameRequired');
    }

    if (!businessData.slug.trim()) {
      errors.slug = t('business.create.validation.slugRequired');
    } else if (!/^[a-z0-9-]+$/.test(businessData.slug)) {
      errors.slug = t('business.create.validation.slugInvalid');
    }

    if (!businessData.city?.trim()) {
      errors.city = t('business.create.validation.cityRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBusinessInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setBusinessData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const handleSubmit = async () => {
    setGlobalError(null);
    clearError();

    try {
      if (!validateBusinessStep()) return;

      if (!createdBusinessId) {
        const cleanData: BusinessCreate = {
          name: businessData.name.trim(),
          slug: businessData.slug.trim(),
          currency: businessData.currency,
          timezone: businessData.timezone,
          country_code: businessData.country_code,
        };

        if (businessData.logo_url?.trim()) cleanData.logo_url = businessData.logo_url.trim();
        if (businessData.address_line1?.trim()) cleanData.address_line1 = businessData.address_line1.trim();
        if (businessData.address_line2?.trim()) cleanData.address_line2 = businessData.address_line2.trim();
        if (businessData.city?.trim()) cleanData.city = businessData.city.trim();
        if (businessData.postal_code?.trim()) cleanData.postal_code = businessData.postal_code.trim();

        const newBusiness = await createBusiness(cleanData);
        setCreatedBusinessId(newBusiness.id);
      }

      setShowSuccess(true);

    } catch (error: any) {
      setGlobalError(error.detail || t('onboarding.errors.genericError'));
    }
  };


  // Removed unused dayNames array

  if (showSuccess) {
    const bookingUrl = `${window.location.origin}/book/${businessData.slug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingUrl)}`;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(bookingUrl);
        // You might want to show a toast notification here
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = bookingUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full"
        >
          {/* Celebration Header */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mb-6"
            >
              <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <SparklesIcon className="w-8 h-8 text-yellow-500" />
              </motion.div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              🎉 {t('onboarding.success.title')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 mb-2"
            >
              <strong>{businessData.name}</strong> {t('onboarding.success.isLive')}
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-green-600 font-medium"
            >
              {t('onboarding.success.customersCanBook')}
            </motion.p>
          </div>

          {/* Booking Link Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <GlobeAltIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{t('onboarding.success.bookingLink')}</h3>
            </div>
            
            <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-3 font-medium">{t('onboarding.success.shareThisLink')}</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
                <input
                  type="text"
                  value={bookingUrl}
                  readOnly
                  className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono min-w-0 touch-manipulation"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap touch-manipulation"
                >
                  {t('common.copy')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t('onboarding.success.qrCode')}</h4>
                <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for booking"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('onboarding.success.qrCodeHelp')}</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t('onboarding.success.quickActions')}</h4>
                
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium space-x-2"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  <span>{t('onboarding.success.testBooking')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
                <button
                  onClick={() => navigate(`/business/${createdBusinessId}`)}
                  className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium space-x-2"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>{t('onboarding.success.manageBusiness')}</span>
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
                  </svg>
                  <span>{t('onboarding.success.goToDashboard')}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{t('onboarding.success.nextSteps')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                  <h4 className="font-medium text-blue-900">{t('onboarding.success.step1.title')}</h4>
                </div>
                <p className="text-blue-700">{t('onboarding.success.step1.description')}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-2">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                  <h4 className="font-medium text-green-900">{t('onboarding.success.step2.title')}</h4>
                </div>
                <p className="text-green-700">{t('onboarding.success.step2.description')}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-2">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                  <h4 className="font-medium text-purple-900">{t('onboarding.success.step3.title')}</h4>
                </div>
                <p className="text-purple-700">{t('onboarding.success.step3.description')}</p>
              </div>
            </div>
          </motion.div>


        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className={`${containerWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('onboarding.title')}</h1>
                <p className="text-sm text-gray-600">{t('onboarding.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Guide Link */}
              <a
                href="/guide"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {t('onboarding.needHelp')}
              </a>
              <SparklesIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className={`${containerWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {/* Reassuring Message */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                {t('onboarding.reassurance.title')}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {t('onboarding.reassurance.description')}
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Global Error */}
          {(globalError || businessError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
            >
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{globalError || businessError}</span>
            </motion.div>
          )}

          <motion.div
            key="business-info"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {t('onboarding.notice.servicesAfterSignup')}
                </p>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('business.sections.basic.title')}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('business.fields.name.required')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={businessData.name}
                      onChange={handleBusinessInputChange}
                      placeholder={t('business.fields.name.placeholder')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation ${
                        validationErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('business.create.fields.slug')}
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={businessData.slug}
                      onChange={handleBusinessInputChange}
                      placeholder={t('business.create.fields.slug.placeholder')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.slug ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                      <InformationCircleIcon className="w-3 h-3" />
                      <span>{t('business.create.fields.slug.help')}</span>
                    </div>
                    {validationErrors.slug && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                      <PhotoIcon className="w-4 h-4 inline mr-1" />
                      {t('business.fields.logoUrl')}
                    </label>
                    <input
                      type="url"
                      id="logo_url"
                      name="logo_url"
                      value={businessData.logo_url}
                      onChange={handleBusinessInputChange}
                      placeholder={t('business.fields.logoUrl.placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Regional Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <GlobeAltIcon className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('business.sections.regional.title')}</h2>
                </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                      <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                      {t('business.fields.currency')} ({t('auth.optional')})
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={businessData.currency}
                      onChange={handleBusinessInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">Euro (EUR)</option>
                      <option value="ALL">Albanian Lek (ALL)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="GBP">British Pound (GBP)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      {t('business.fields.timezone')}
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={businessData.timezone}
                      onChange={handleBusinessInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Europe/Tirane">Europe/Tirane</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/Berlin">Europe/Berlin</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPinIcon className="w-6 h-6 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('business.sections.address.title')}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('business.fields.addressLine1')} ({t('auth.optional')})
                    </label>
                    <input
                      type="text"
                      id="address_line1"
                      name="address_line1"
                      value={businessData.address_line1}
                      onChange={handleBusinessInputChange}
                      placeholder={t('business.fields.addressLine1.placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('business.fields.addressLine2')} ({t('auth.optional')})
                    </label>
                    <input
                      type="text"
                      id="address_line2"
                      name="address_line2"
                      value={businessData.address_line2}
                      onChange={handleBusinessInputChange}
                      placeholder={t('business.fields.addressLine2.placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('business.fields.city')} *
                      </label>
                                             <select
                         id="city"
                         name="city"
                         required={true}
                         value={businessData.city}
                         onChange={handleBusinessInputChange}
                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                           validationErrors.city ? 'border-red-500' : 'border-gray-300'
                         }`}
                       >
                         <option value="">{t('business.fields.city.select')}</option>
                        {ALBANIAN_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {validationErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('business.fields.postalCode')} ({t('auth.optional')})
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        value={businessData.postal_code}
                        onChange={handleBusinessInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

        </AnimatePresence>

        {/* Submit */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            disabled={creatingBusiness}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          >
            {creatingBusiness && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            <span>{t('onboarding.complete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessOnboarding; 