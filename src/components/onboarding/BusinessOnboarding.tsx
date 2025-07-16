import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBusinessCreate } from '../../hooks/useBusinessCreate';
import { useServices } from '../../hooks/useServices';
import { useTables } from '../../hooks/useTables';
import { useTranslation } from '../../hooks/useTranslation';
import { BusinessCreate, ServiceCreate, TableCreate } from '../../types';
import {
  BuildingStorefrontIcon,
  PhotoIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  RectangleGroupIcon,
  SparklesIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const BusinessOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { creating: creatingBusiness, error: businessError, createBusiness, clearError } = useBusinessCreate();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Services hook (only initialized after business is created)
  const servicesHook = useServices({ bizId: createdBusinessId || '' });
  const tablesHook = useTables({ bizId: createdBusinessId || '' });

  // Step 1: Business Information
  const [businessData, setBusinessData] = useState<BusinessCreate>({
    name: '',
    slug: '',
    currency: 'ALL',
    timezone: 'Europe/Tirane',
    logo_url: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country_code: 'AL',
  });

  // Step 2: Services
  const [services, setServices] = useState<ServiceCreate[]>([]);

  // Initialize default service when component mounts
  useEffect(() => {
    setServices([{
      name: 'Dining',
      description: t('onboarding.defaultService.description'),
      duration_minutes: 120,
      price_minor: 0, // Free base service, pricing handled per item
      is_active: true,
      opening_hours: [
        { day_of_week: 1, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Monday
        { day_of_week: 2, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Tuesday
        { day_of_week: 3, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Wednesday
        { day_of_week: 4, opens_at: '09:00', closes_at: '22:00', is_closed: false }, // Thursday
        { day_of_week: 5, opens_at: '09:00', closes_at: '23:00', is_closed: false }, // Friday
        { day_of_week: 6, opens_at: '10:00', closes_at: '23:00', is_closed: false }, // Saturday
        { day_of_week: 0, opens_at: '10:00', closes_at: '21:00', is_closed: false }, // Sunday
      ],
    }]);
  }, [t]);

  // Step 3: Tables (will be populated after services are created)
  const [createdServices, setCreatedServices] = useState<any[]>([]);
  const [tables, setTables] = useState<{ [serviceId: string]: TableCreate[] }>({});

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const steps = [
    { number: 1, title: t('onboarding.steps.business.title'), description: t('onboarding.steps.business.description') },
    { number: 2, title: t('onboarding.steps.services.title'), description: t('onboarding.steps.services.description') },
    { number: 3, title: t('onboarding.steps.tables.title'), description: t('onboarding.steps.tables.description') },
  ];

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateServicesStep = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (services.length === 0) {
      errors.services = t('onboarding.validation.servicesRequired');
    }

    services.forEach((service, index) => {
      if (!service.name.trim()) {
        errors[`service_${index}_name`] = t('onboarding.validation.serviceNameRequired');
      }
      if (service.duration_minutes <= 0) {
        errors[`service_${index}_duration`] = t('onboarding.validation.serviceDurationRequired');
      }
    });

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

  const handleServiceChange = (index: number, field: string, value: any) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ));

    // Clear validation error
    const errorKey = `service_${index}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const handleServiceHoursChange = (serviceIndex: number, dayIndex: number, field: string, value: any) => {
    setServices(prev => prev.map((service, i) => 
      i === serviceIndex 
        ? {
            ...service,
            opening_hours: service.opening_hours.map((hours, j) =>
              j === dayIndex ? { ...hours, [field]: value } : hours
            )
          }
        : service
    ));
  };

  const addService = () => {
    setServices(prev => [...prev, {
      name: '',
      description: '',
      duration_minutes: 120,
      price_minor: 0,
      is_active: true,
      opening_hours: [
        { day_of_week: 1, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 2, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 3, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 4, opens_at: '09:00', closes_at: '22:00', is_closed: false },
        { day_of_week: 5, opens_at: '09:00', closes_at: '23:00', is_closed: false },
        { day_of_week: 6, opens_at: '10:00', closes_at: '23:00', is_closed: false },
        { day_of_week: 0, opens_at: '10:00', closes_at: '21:00', is_closed: false },
      ],
    }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const addTable = (serviceId: string) => {
    setTables(prev => ({
      ...prev,
      [serviceId]: [
        ...(prev[serviceId] || []),
        {
          service_id: serviceId,
          code: `T${(prev[serviceId]?.length || 0) + 1}`,
          seats: 4,
          is_active: true,
        }
      ]
    }));
  };

  const removeTable = (serviceId: string, tableIndex: number) => {
    setTables(prev => ({
      ...prev,
      [serviceId]: prev[serviceId]?.filter((_, i) => i !== tableIndex) || []
    }));
  };

  const handleTableChange = (serviceId: string, tableIndex: number, field: string, value: any) => {
    setTables(prev => ({
      ...prev,
      [serviceId]: prev[serviceId]?.map((table, i) =>
        i === tableIndex ? { ...table, [field]: value } : table
      ) || []
    }));
  };

  const handleNext = async () => {
    setGlobalError(null);
    clearError();

    try {
      if (currentStep === 1) {
        if (!validateBusinessStep()) return;
        
        // Create business
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
        setCurrentStep(2);

      } else if (currentStep === 2) {
        if (!validateServicesStep()) return;

        if (!createdBusinessId) {
          setGlobalError(t('onboarding.errors.businessNotCreated'));
          return;
        }

        // Create services
        const createdServicesList = [];
        for (const serviceData of services) {
          try {
            const service = await servicesHook.createService(serviceData);
            createdServicesList.push(service);
          } catch (error) {
            console.error('Error creating service:', error);
            // Continue with other services even if one fails
          }
        }
        setCreatedServices(createdServicesList);

        // Initialize tables for each service
        const initialTables: { [serviceId: string]: TableCreate[] } = {};
        createdServicesList.forEach(service => {
          initialTables[service.id] = [
            { service_id: service.id, code: 'T1', seats: 2, is_active: true },
            { service_id: service.id, code: 'T2', seats: 4, is_active: true },
            { service_id: service.id, code: 'T3', seats: 6, is_active: true },
          ];
        });
        setTables(initialTables);
        setCurrentStep(3);

      } else if (currentStep === 3) {
        if (!createdBusinessId) {
          setGlobalError(t('onboarding.errors.businessNotCreatedStartOver'));
          return;
        }

        // Create tables for each service
        for (const serviceId in tables) {
          const serviceTables = tables[serviceId];
          for (const tableData of serviceTables) {
            try {
              await tablesHook.createTable(tableData);
            } catch (error) {
              console.error('Error creating table:', error);
              // Continue with other tables even if one fails
            }
          }
        }

        // Complete onboarding
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/business/${createdBusinessId}`);
        }, 2000);
      }

    } catch (error: any) {
      setGlobalError(error.detail || t('onboarding.errors.genericError'));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const dayNames = [
    t('days.sunday'), 
    t('days.monday'), 
    t('days.tuesday'), 
    t('days.wednesday'), 
    t('days.thursday'), 
    t('days.friday'), 
    t('days.saturday')
  ];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md"
        >
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('onboarding.success.title')}</h2>
          <p className="text-gray-600 mb-4">{t('onboarding.success.description')}</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.title')}</h1>
                <p className="text-sm text-gray-600">{t('onboarding.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ml-4 mr-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('business.sections.basic.title')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                      <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                      {t('business.fields.currency')}
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={businessData.currency}
                      onChange={handleBusinessInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ALL">Albanian Lek (ALL)</option>
                      <option value="EUR">Euro (EUR)</option>
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
                      {t('business.fields.addressLine1')}
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
                      {t('business.fields.addressLine2')}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('business.fields.city')}
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={businessData.city}
                        onChange={handleBusinessInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('business.fields.postalCode')}
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
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <CogIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('onboarding.steps.services.title')}</h2>
                  </div>
                  <button
                    onClick={addService}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    {t('onboarding.addService')}
                  </button>
                </div>

                {validationErrors.services && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{validationErrors.services}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {services.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-medium text-gray-900">
                          {t('onboarding.service')} {index + 1}
                        </h3>
                        {services.length > 1 && (
                          <button
                            onClick={() => removeService(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('onboarding.serviceName')}
                          </label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              validationErrors[`service_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={t('onboarding.serviceNamePlaceholder')}
                          />
                          {validationErrors[`service_${index}_name`] && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors[`service_${index}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('onboarding.serviceDuration')}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              value={service.duration_minutes}
                              onChange={(e) => handleServiceChange(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                validationErrors[`service_${index}_duration`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              min="1"
                            />
                            <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-lg">
                              {t('onboarding.minutes')}
                            </span>
                          </div>
                          {validationErrors[`service_${index}_duration`] && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors[`service_${index}_duration`]}</p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('onboarding.serviceDescription')}
                        </label>
                        <textarea
                          value={service.description || ''}
                          onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder={t('onboarding.serviceDescriptionPlaceholder')}
                        />
                      </div>

                      {/* Operating Hours */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('onboarding.operatingHours')}</h4>
                        <div className="space-y-2">
                          {service.opening_hours.map((hours, dayIndex) => (
                            <div key={dayIndex} className="flex items-center space-x-4">
                              <div className="w-20 text-sm text-gray-600">
                                {dayNames[hours.day_of_week]}
                              </div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={!hours.is_closed}
                                  onChange={(e) => handleServiceHoursChange(index, dayIndex, 'is_closed', !e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-600">{t('onboarding.open')}</span>
                              </label>
                              {!hours.is_closed && (
                                <>
                                  <input
                                    type="time"
                                    value={hours.opens_at}
                                    onChange={(e) => handleServiceHoursChange(index, dayIndex, 'opens_at', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                  <span className="text-sm text-gray-600">to</span>
                                  <input
                                    type="time"
                                    value={hours.closes_at}
                                    onChange={(e) => handleServiceHoursChange(index, dayIndex, 'closes_at', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Tables */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <RectangleGroupIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('onboarding.steps.tables.title')}</h2>
                </div>

                <div className="space-y-6">
                  {createdServices.map((service, serviceIndex) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-medium text-gray-900">{service.name}</h3>
                        <button
                          onClick={() => addTable(service.id)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          {t('onboarding.addTable')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(tables[service.id] || []).map((table, tableIndex) => (
                          <div key={tableIndex} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">
                                {t('onboarding.table')} {tableIndex + 1}
                              </h4>
                              <button
                                onClick={() => removeTable(service.id, tableIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {t('onboarding.tableCode')}
                                </label>
                                <input
                                  type="text"
                                  value={table.code}
                                  onChange={(e) => handleTableChange(service.id, tableIndex, 'code', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="T1"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {t('onboarding.tableSeats')}
                                </label>
                                <input
                                  type="number"
                                  value={table.seats}
                                  onChange={(e) => handleTableChange(service.id, tableIndex, 'seats', parseInt(e.target.value) || 1)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {(!tables[service.id] || tables[service.id].length === 0) && (
                        <div className="text-center py-6 text-gray-500">
                          <RectangleGroupIcon className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">{t('onboarding.noTablesYet')}</p>
                          <p className="text-xs">{t('onboarding.clickAddTable')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{t('onboarding.back')}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={creatingBusiness || servicesHook.creating || tablesHook.creating}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(creatingBusiness || servicesHook.creating || tablesHook.creating) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {currentStep === 3 
                ? t('onboarding.complete') 
                : t('onboarding.next')
              }
            </span>
            {currentStep < 3 && <ArrowRightIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessOnboarding; 