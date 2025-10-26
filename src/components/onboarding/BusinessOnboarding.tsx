import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBusinessCreate } from '../../hooks/useBusinessCreate';
import { useServices } from '../../hooks/useServices';
import { useTables } from '../../hooks/useTables';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import { useTranslation } from '../../hooks/useTranslation';
import { useBusinessSubscription } from '../../hooks/useBusinessSubscription';
import { BusinessCreate, ServiceCreate, TableCreate, ServiceOpenIntervalCreate, Weekday, BookingMode, SubscriptionPlan } from '../../types';
import { serviceApi } from '../../utils/api';
import PaymentModal from '../subscription/PaymentModal';
import {
  BuildingStorefrontIcon,
  PhotoIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  GlobeAltIcon as GlobeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  RectangleGroupIcon,
  SparklesIcon,
  XMarkIcon,
  PlusIcon,
  CreditCardIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
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
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useServiceCategories();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [skipSubscription, setSkipSubscription] = useState(false);
  
  // Subscription selection state
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Services hook (only initialized after business is created)
  const servicesHook = useServices({ bizId: createdBusinessId || '' });
  const tablesHook = useTables({ bizId: createdBusinessId || '' });

  // Subscription plans hook
  const { 
    plans, 
    plansLoading, 
    error: plansError, 
    fetchPlans 
  } = useBusinessSubscription({ 
    businessId: createdBusinessId || '', 
    autoFetch: false 
  });

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

  // Step 2: Services
  const [services, setServices] = useState<ServiceCreate[]>([]);

  // Step 3: Tables - Business-level tables (shared across all services)
  const [tables, setTables] = useState<TableCreate[]>([]);
  const [createdServices, setCreatedServices] = useState<any[]>([]);

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Business creation status (removed unused currentError state)
  
  // Modal state for tables help
  const [showTablesHelpModal, setShowTablesHelpModal] = useState(false);

  // Refresh categories when reaching step 2 (services) to ensure current language
  useEffect(() => {
    if (currentStep === 2) {
      refetchCategories();
    }
  }, [currentStep, refetchCategories]);

  // Fetch subscription plans when reaching step 4 and business is created
  useEffect(() => {
    if (currentStep === 4 && createdBusinessId) {
      fetchPlans();
    }
  }, [currentStep, createdBusinessId, fetchPlans]);

  // Handle skip subscription
  useEffect(() => {
    if (skipSubscription) {
      setShowSuccess(true);
    }
  }, [skipSubscription]);

  const defaultServiceIntervals: ServiceOpenIntervalCreate[] = [
    { weekday: Weekday.monday, start_time: '09:00', end_time: '22:00' },
    { weekday: Weekday.tuesday, start_time: '09:00', end_time: '22:00' },
    { weekday: Weekday.wednesday, start_time: '09:00', end_time: '22:00' },
    { weekday: Weekday.thursday, start_time: '09:00', end_time: '22:00' },
    { weekday: Weekday.friday, start_time: '09:00', end_time: '23:00' },
    { weekday: Weekday.saturday, start_time: '10:00', end_time: '23:00' },
    { weekday: Weekday.sunday, start_time: '10:00', end_time: '21:00' },
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

  // Get all available plans for the selected billing period
  const getAvailablePlans = (): SubscriptionPlan[] => {
    const allPlans: SubscriptionPlan[] = [];
    
    // Iterate through all product categories
    Object.values(plans).forEach(productPlans => {
      // Filter plans by billing period
      const filteredPlans = productPlans.filter(plan => 
        plan.interval === (billingPeriod === 'yearly' ? 'year' : 'month')
      );
      allPlans.push(...filteredPlans);
    });
    
    return allPlans.sort((a, b) => a.price - b.price); // Sort by price
  };

  // Get the free plan (price = 0)
  const getFreePlan = (): SubscriptionPlan | null => {
    const allPlans = getAvailablePlans();
    return allPlans.find(plan => plan.price === 0) || null;
  };

  // Get paid plans sorted by price
  const getPaidPlans = (): SubscriptionPlan[] => {
    return getAvailablePlans().filter(plan => plan.price > 0);
  };

  // Check if a plan is popular (middle tier or marked as such)
  const isPlanPopular = (plan: SubscriptionPlan): boolean => {
    const paidPlans = getPaidPlans();
    return paidPlans.length > 1 && 
      (plan.tier?.toLowerCase() === 'standard' || 
       plan.tier?.toLowerCase() === 'pro' ||
       (paidPlans.length === 2 && plan.price > paidPlans[0].price));
  };

  // Handle plan selection
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      // Free plan - skip subscription
      setSkipSubscription(true);
    } else {
      // Paid plan - open payment modal
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setShowSuccess(true);
  };

  const steps = [
    { number: 1, title: t('onboarding.steps.business.title'), description: t('onboarding.steps.business.description') },
    { number: 2, title: t('onboarding.steps.services.title'), description: t('onboarding.steps.services.description') },
    { number: 3, title: t('onboarding.steps.tables.title'), description: t('onboarding.steps.tables.description') },
    { number: 4, title: t('onboarding.steps.subscription.title'), description: t('onboarding.steps.subscription.description') },
  ];

  const containerWidthClass = currentStep === 4 ? 'max-w-7xl' : 'max-w-4xl';

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

  const validateServicesStep = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (services.length === 0) {
      errors.services = t('onboarding.validation.servicesRequired');
    }

    services.forEach((service, index) => {
      if (!service.name.trim()) {
        errors[`service_${index}_name`] = t('onboarding.validation.serviceNameRequired');
      }
      if (!service.duration_min || service.duration_min <= 0) {
        errors[`service_${index}_duration`] = t('onboarding.validation.serviceDurationRequired');
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTablesConfiguration = (): boolean => {
    // Check if any tables are configured
    const totalTables = tables.length;
    // Tables are optional - if no tables are configured, that's fine
    
    return true; // Tables are optional, so always return true
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

    // Auto-generate slug from name
    if (field === 'name') {
      setServices(prev => prev.map((service, i) => 
        i === index ? { ...service, slug: generateSlug(value) } : service
      ));
    }

    // Clear validation error
    const errorKey = `service_${index}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  // Removed unused handleServiceHoursChange function

  const handleServiceIntervalChange = (serviceIndex: number, intervalIndex: number, field: string, value: any) => {
    setServices(prev => prev.map((service, i) => 
      i === serviceIndex 
        ? {
            ...service,
            open_intervals: service.open_intervals?.map((interval, j) =>
              j === intervalIndex ? { ...interval, [field]: value } : interval
            ) || []
          }
        : service
    ));
  };

  const handleAddServiceInterval = (serviceIndex: number) => {
    const newInterval: ServiceOpenIntervalCreate = {
      weekday: Weekday.monday,
      start_time: '09:00',
      end_time: '17:00',
    };
    
    setServices(prev => prev.map((service, i) => 
      i === serviceIndex 
        ? {
            ...service,
            open_intervals: [...(service.open_intervals || []), newInterval]
          }
        : service
    ));
  };

  const handleRemoveServiceInterval = (serviceIndex: number, intervalIndex: number) => {
    setServices(prev => prev.map((service, i) => 
      i === serviceIndex 
        ? {
            ...service,
            open_intervals: service.open_intervals?.filter((_, j) => j !== intervalIndex) || []
          }
        : service
    ));
  };

  const handleQuickSetup = (serviceIndex: number, preset: 'weekdays' | 'weekends' | 'daily') => {
    const baseHours = { start_time: '09:00', end_time: '17:00' };
    
    let intervals: ServiceOpenIntervalCreate[] = [];
    
    switch (preset) {
      case 'weekdays':
        intervals = [
          { weekday: Weekday.monday, ...baseHours },
          { weekday: Weekday.tuesday, ...baseHours },
          { weekday: Weekday.wednesday, ...baseHours },
          { weekday: Weekday.thursday, ...baseHours },
          { weekday: Weekday.friday, ...baseHours },
        ];
        break;
      case 'weekends':
        intervals = [
          { weekday: Weekday.saturday, ...baseHours },
          { weekday: Weekday.sunday, ...baseHours },
        ];
        break;
      case 'daily':
        intervals = weekdayOptions.map(day => ({ weekday: day.weekday, ...baseHours }));
        break;
    }
    
    setServices(prev => prev.map((service, i) => 
      i === serviceIndex 
        ? {
            ...service,
            open_intervals: intervals
          }
        : service
    ));
  };

  const addService = () => {
    setServices(prev => [...prev, {
      name: '',
      slug: '',
      description: '',
      duration_min: 15,
      price_minor: 0,
      category_id: '',
      is_active: true,
      booking_mode: BookingMode.appointment,
      open_intervals: defaultServiceIntervals,
    }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const addTable = () => {
    const newTableCode = `T${tables.length + 1}`;
    
    const newTable: TableCreate = {
      service_id: '', // Will be set during table creation (not needed for business-level tables)
      code: newTableCode,
      seats: 4,
      is_active: true,
    };
    
    setTables(prev => [...prev, newTable]);
  };

  const removeTable = (tableIndex: number) => {
    setTables(prev => prev.filter((_, i) => i !== tableIndex));
  };

  const handleTableChange = (tableIndex: number, field: string, value: any) => {
    setTables(prev => prev.map((table, i) =>
      i === tableIndex ? { ...table, [field]: value } : table
    ));
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
        
        // Validate tables configuration
        validateTablesConfiguration();

        if (!createdBusinessId) {
          setGlobalError(t('onboarding.errors.businessNotCreated'));
          return;
        }

        // Create services
        const createdServicesList = [];
        const serviceCreationErrors: string[] = [];
        
        for (let index = 0; index < services.length; index++) {
          const serviceData = services[index];
          try {
            // Validate service data before creation
            if (!serviceData.name?.trim()) {
              const error = `Service ${index + 1} has empty name`;
              serviceCreationErrors.push(error);
              continue;
            }
            
            if (!serviceData.duration_min || serviceData.duration_min <= 0) {
              const error = `Service ${serviceData.name} has invalid duration: ${serviceData.duration_min}`;
              serviceCreationErrors.push(error);
              continue;
            }
            
            // Clean the service data - set default category if none selected
            const cleanServiceData = { ...serviceData };
            if (!cleanServiceData.category_id || cleanServiceData.category_id.trim() === '') {
              // Find the "Other" category by slug
              const otherCategory = categories.find(cat => cat.slug === 'other' || cat.slug === 'others' || cat.name.toLowerCase().includes('other'));
              if (otherCategory) {
                cleanServiceData.category_id = otherCategory.id;
              } else {
                // If no "Other" category found, omit the field (fallback to previous behavior)
                delete cleanServiceData.category_id;
              }
            }

            // For session-based services, clear open intervals
            if (cleanServiceData.booking_mode === BookingMode.session) {
              cleanServiceData.open_intervals = [];
            }
            
            const service = await serviceApi.createService(createdBusinessId, cleanServiceData);
            createdServicesList.push(service);
          } catch (error: any) {
            const errorMessage = error?.detail || error?.message || JSON.stringify(error);
            const fullError = `Failed to create service ${serviceData.name || `#${index + 1}`}: ${errorMessage}`;
            serviceCreationErrors.push(fullError);
            
            // Continue with other services even if one fails
          }
        }
        

        
        // Check if any services were created
        if (createdServicesList.length === 0) {
          const errorSummary = serviceCreationErrors.length > 0 
            ? serviceCreationErrors.slice(0, 2).join('; ')
            : 'Unknown error occurred';
          setGlobalError(`Failed to create any services. ${errorSummary}`);
          return;
        }
        
        setCreatedServices(createdServicesList);
        setCurrentStep(3);

      } else if (currentStep === 3) {
        if (!createdBusinessId) {
          setGlobalError(t('onboarding.errors.businessNotCreatedStartOver'));
          return;
        }

        // Check if there are any tables to create
        const totalTables = tables.length;

        if (totalTables === 0) {
          setCurrentStep(4); // Go to subscription selection
          return;
        }

        // Create business-level tables using the first service (backend handles business lookup)
        const firstServiceId = createdServices[0]?.id;
        if (!firstServiceId) {
          setGlobalError('No services created. Cannot create tables.');
          return;
        }

        let tablesCreated = 0;
        let tablesFailures = 0;
        const failureDetails: string[] = [];
        
        for (let i = 0; i < tables.length; i++) {
          const tableData = tables[i];
          
          try {
            // Validate table data
            if (!tableData.code?.trim()) {
              const error = `Table code is empty for table ${i + 1}`;
              failureDetails.push(error);
              tablesFailures++;
              continue;
            }
            
            // Handle empty seats by defaulting to 1
            const seats = tableData.seats || 1;
            if (seats < 1) {
              const error = `Invalid seats (${seats}) for table ${tableData.code} - must be at least 1`;
              failureDetails.push(error);
              tablesFailures++;
              continue;
            }
            
            // Create table through any service (tables belong to business)
            const tableWithServiceId: TableCreate = { 
              service_id: firstServiceId,
              code: tableData.code.trim(),
              seats: seats,
              merge_group: tableData.merge_group?.trim() || undefined,
              is_active: tableData.is_active !== false
            };
            
            await serviceApi.addServiceTable(firstServiceId, tableWithServiceId);
            tablesCreated++;
          } catch (error: any) {
            tablesFailures++;
            const errorMessage = error?.detail || error?.message || JSON.stringify(error);
            const fullError = `Failed to create table ${tableData.code}: ${errorMessage}`;
            failureDetails.push(fullError);
          }
        }

        if (tablesFailures > 0 && tablesCreated === 0) {
          setGlobalError(`Failed to create any tables. Errors: ${failureDetails.slice(0, 3).join('; ')}${failureDetails.length > 3 ? '...' : ''}`);
          return;
        }
        
        if (tablesFailures > 0) {
          setGlobalError(`Warning: ${tablesFailures} table(s) failed to create. ${tablesCreated} created successfully.`);
        }

        setCurrentStep(4); // Go to subscription selection
      } else if (currentStep === 4) {
        // Step 4: Subscription Selection - Complete onboarding
        setShowSuccess(true);
      }

    } catch (error: any) {
      setGlobalError(error.detail || t('onboarding.errors.genericError'));
    }
  };



  // Removed unused dayNames array

  const weekdayOptions = [
    { weekday: Weekday.monday, name: t('days.monday'), short: t('days.short.monday') },
    { weekday: Weekday.tuesday, name: t('days.tuesday'), short: t('days.short.tuesday') },
    { weekday: Weekday.wednesday, name: t('days.wednesday'), short: t('days.short.wednesday') },
    { weekday: Weekday.thursday, name: t('days.thursday'), short: t('days.short.thursday') },
    { weekday: Weekday.friday, name: t('days.friday'), short: t('days.short.friday') },
    { weekday: Weekday.saturday, name: t('days.saturday'), short: t('days.short.saturday') },
    { weekday: Weekday.sunday, name: t('days.sunday'), short: t('days.short.sunday') },
  ];

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
                <div className="flex items-center justify-between mb-3">
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
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mr-2" />
                  <p className="text-sm text-blue-700">
                    {t('onboarding.serviceConfigurationNote')}
                  </p>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                            {t('onboarding.serviceCategory')}
                          </label>
                          <select
                            value={service.category_id || ''}
                            onChange={(e) => handleServiceChange(index, 'category_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={categoriesLoading}
                          >
                            <option value="">{t('onboarding.selectCategory')}</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {categoriesLoading && (
                            <p className="mt-1 text-sm text-gray-500">{t('onboarding.loadingCategories')}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('onboarding.serviceDuration')}
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              value={service.duration_min}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value > 0) {
                                  handleServiceChange(index, 'duration_min', value);
                                } else if (e.target.value === '') {
                                  handleServiceChange(index, 'duration_min', '');
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                validationErrors[`service_${index}_duration`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              min="1"
                              required
                              placeholder="15"
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
                          {t('services.bookingMode.title')} *
                        </label>
                        <select
                          value={service.booking_mode || BookingMode.appointment}
                          onChange={(e) => handleServiceChange(index, 'booking_mode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value={BookingMode.appointment}>
                            {t('services.bookingMode.appointment')}
                          </option>
                          <option value={BookingMode.session}>
                            {t('services.bookingMode.session')}
                          </option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          {(service.booking_mode || BookingMode.appointment) === BookingMode.appointment 
                            ? t('services.bookingMode.appointmentDescription')
                            : t('services.bookingMode.sessionDescription')
                          }
                        </p>
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

                      {/* Operating Hours - Only for appointment-based services */}
                      {(service.booking_mode || BookingMode.appointment) === BookingMode.appointment && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">{t('onboarding.operatingHours')}</h4>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleQuickSetup(index, 'weekdays')}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            >
                              {t('serviceOpenIntervals.weekdaysOnly')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickSetup(index, 'daily')}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            >
                              {t('serviceOpenIntervals.allDays')}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {(service.open_intervals || []).map((interval, intervalIndex) => (
                            <div key={intervalIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-lg">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {t('serviceOpenIntervals.weekday')}
                                </label>
                                <select
                                  value={interval.weekday}
                                  onChange={(e) => handleServiceIntervalChange(index, intervalIndex, 'weekday', e.target.value as unknown as Weekday)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {weekdayOptions.map((option) => (
                                    <option key={option.weekday} value={option.weekday}>
                                      {option.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {t('serviceOpenIntervals.startTime')}
                                </label>
                                <input
                                  type="time"
                                  value={interval.start_time}
                                  onChange={(e) => handleServiceIntervalChange(index, intervalIndex, 'start_time', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  lang="fr-FR"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {t('serviceOpenIntervals.endTime')}
                                </label>
                                <input
                                  type="time"
                                  value={interval.end_time}
                                  onChange={(e) => handleServiceIntervalChange(index, intervalIndex, 'end_time', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  lang="fr-FR"
                                />
                              </div>

                              <div className="flex items-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddServiceInterval(index)}
                                  className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                                  title={t('serviceOpenIntervals.addInterval')}
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                                {service.open_intervals && service.open_intervals.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveServiceInterval(index, intervalIndex)}
                                    className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                                    title={t('common.remove')}
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {(!service.open_intervals || service.open_intervals.length === 0) && (
                          <div className="text-center py-4 border border-gray-200 rounded-lg">
                            <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 mb-2">{t('serviceOpenIntervals.noIntervals')}</p>
                            <button
                              type="button"
                              onClick={() => handleAddServiceInterval(index)}
                              className="inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            >
                              <PlusIcon className="w-4 h-4 mr-1" />
                              {t('serviceOpenIntervals.addInterval')}
                            </button>
                          </div>
                        )}
                      </div>
                      )}

                      {/* Session Mode Information */}
                      {(service.booking_mode || BookingMode.appointment) === BookingMode.session && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <InformationCircleIcon className="w-5 h-5 text-yellow-600" />
                          <h5 className="text-sm font-medium text-gray-900">{t('services.bookingMode.sessionInfo.title')}</h5>
                        </div>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>{t('services.bookingMode.sessionInfo.description')}</p>
                          <ul className="list-disc list-inside space-y-1 ml-3">
                            <li>{t('services.bookingMode.sessionInfo.point1')}</li>
                            <li>{t('services.bookingMode.sessionInfo.point2')}</li>
                            <li>{t('services.bookingMode.sessionInfo.point3')}</li>
                          </ul>
                        </div>
                      </div>
                      )}
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
                  <button
                    type="button"
                    onClick={() => setShowTablesHelpModal(true)}
                    className="ml-auto flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <InformationCircleIcon className="w-4 h-4" />
                    <span>{t('onboarding.tables.helpButton')}</span>
                  </button>
                </div>

                {/* Compact explanation note */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mr-2" />
                  <p className="text-sm text-blue-700">
                    {t('onboarding.tables.briefDescription')}
                  </p>
                </div>

                {/* Tables Help Modal */}
                <AnimatePresence>
                  {showTablesHelpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {t('onboarding.tables.whatAreUnits.title')}
                            </h3>
                            <button
                              onClick={() => setShowTablesHelpModal(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="w-6 h-6" />
                            </button>
                          </div>
                          
                          <p className="text-gray-600 mb-4">
                            {t('onboarding.tables.whatAreUnits.description')}
                          </p>
                          
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                              {t('onboarding.tables.sharedResource.title')}
                            </h4>
                            <p className="text-sm text-blue-700">
                              {t('onboarding.tables.sharedResource.description')}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <h4 className="font-medium text-gray-900 text-sm mb-3">
                                {t('onboarding.tables.examples.restaurants.title')}
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>• {t('onboarding.tables.examples.restaurants.table2seats')}</li>
                                <li>• {t('onboarding.tables.examples.restaurants.table4seats')}</li>
                                <li>• {t('onboarding.tables.examples.restaurants.barCounter')}</li>
                              </ul>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <h4 className="font-medium text-gray-900 text-sm mb-3">
                                {t('onboarding.tables.examples.salons.title')}
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>• {t('onboarding.tables.examples.salons.chair1')}</li>
                                <li>• {t('onboarding.tables.examples.salons.chair2')}</li>
                                <li>• {t('onboarding.tables.examples.salons.washStation')}</li>
                              </ul>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <h4 className="font-medium text-gray-900 text-sm mb-3">
                                {t('onboarding.tables.examples.consultations.title')}
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>• {t('onboarding.tables.examples.consultations.room1')}</li>
                                <li>• {t('onboarding.tables.examples.consultations.room2')}</li>
                                <li>• {t('onboarding.tables.examples.consultations.onlineSlot')}</li>
                              </ul>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <h4 className="font-medium text-gray-900 text-sm mb-3">
                                {t('onboarding.tables.examples.general.title')}
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-2">
                                <li>• {t('onboarding.tables.examples.general.unit1')}</li>
                                <li>• {t('onboarding.tables.examples.general.unit2')}</li>
                                <li>• {t('onboarding.tables.examples.general.unitA')}</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>{t('onboarding.tables.note.title')}:</strong> {t('onboarding.tables.note.description')}
                            </p>
                          </div>
                          
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={() => setShowTablesHelpModal(false)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {t('common.close')}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Shared Resource Notice */}
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <InformationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">
                        {t('onboarding.tables.sharedResource.title')}
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {t('onboarding.tables.sharedResource.description')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Tables Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">
                        {t('onboarding.tables.businessLevel.title')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('onboarding.tables.businessLevel.description')}
                      </p>
                    </div>
                    <button
                      onClick={() => addTable()}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      {t('onboarding.addTable')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((table, tableIndex) => (
                      <div key={tableIndex} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {t('onboarding.table')} {tableIndex + 1}
                          </h4>
                          <button
                            onClick={() => removeTable(tableIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('onboarding.tableCode')}
                            </label>
                            <input
                              type="text"
                              value={table.code}
                              onChange={(e) => handleTableChange(tableIndex, 'code', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="T1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('onboarding.seats')}
                            </label>
                            <input
                              type="number"
                              value={table.seats}
                              onChange={(e) => handleTableChange(tableIndex, 'seats', parseInt(e.target.value) || '')}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                              placeholder="1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {tables.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <RectangleGroupIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{t('onboarding.noTables')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Subscription Selection */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <CreditCardIcon className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900">{t('onboarding.subscription.chooseYourPlan')}</h2>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t('onboarding.subscription.readyMessage', { businessName: businessData.name })}
                </p>
              </div>

              {/* Loading State */}
              {plansLoading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 text-lg">{t('onboarding.subscription.loadingPlans')}</span>
                </div>
              )}

              {/* Error State */}
              {plansError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center text-center">
                    <ExclamationCircleIcon className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-medium text-red-800">{t('onboarding.subscription.errorLoadingPlans')}</h3>
                      <p className="text-red-700 mt-1">{plansError}</p>
                      <button
                        onClick={fetchPlans}
                        className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        {t('onboarding.subscription.tryAgain')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Period Toggle */}
              {!plansLoading && !plansError && (
                <div className="flex justify-center mb-12">
                  <div className="bg-gray-100 p-1 rounded-xl shadow-sm">
                    <div className="flex">
                      <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`px-8 py-3 rounded-lg font-medium transition-all ${
                          billingPeriod === 'monthly'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {t('onboarding.subscription.monthly')}
                      </button>
                      <button
                        onClick={() => setBillingPeriod('yearly')}
                        className={`px-8 py-3 rounded-lg font-medium transition-all relative ${
                          billingPeriod === 'yearly'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {t('onboarding.subscription.yearly')}
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {t('onboarding.subscription.save', { percent: '28' })}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Subscription Plans */}
              {!plansLoading && !plansError && (
                <div className="w-full px-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
                    {getAvailablePlans().length === 0 ? (
                      <div className="col-span-full text-center py-20">
                        <ExclamationCircleIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-3">{t('onboarding.subscription.noPlansAvailable')}</h3>
                        <p className="text-gray-600 text-lg mb-6">{t('onboarding.subscription.noPlansMessage')}</p>
                        <button
                          onClick={() => setSkipSubscription(true)}
                          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                        >
                          {t('onboarding.subscription.continueWithBasic')}
                        </button>
                      </div>
                    ) : (
                      getAvailablePlans().map((plan, index) => {
                        const isPopular = isPlanPopular(plan);
                        const monthlyPrice = billingPeriod === 'yearly' && plan.interval === 'year' ? plan.price / 12 : plan.price;
                        const regularYearlyPrice = billingPeriod === 'yearly' && plan.interval === 'year' ? monthlyPrice * 12 * 1.4 : null;
                        const savings = regularYearlyPrice ? regularYearlyPrice - plan.price : null;
                        
                        // Map plan names to translation keys
                        const getPlanNameKey = (planName: string): string => {
                          const lowerName = planName.toLowerCase();
                          if (lowerName.includes('solo')) return 'pricing.solo.name';
                          if (lowerName.includes('team')) return 'pricing.team.name';
                          if (lowerName.includes('business')) return 'pricing.business.name';
                          return planName; // fallback to original name
                        };
                        
                        const getPlanDescriptionKey = (planName: string): string | null => {
                          const lowerName = planName.toLowerCase();
                          if (lowerName.includes('solo')) return 'pricing.solo.description';
                          if (lowerName.includes('team')) return 'pricing.team.description';
                          if (lowerName.includes('business')) return 'pricing.business.description';
                          return null;
                        };

                        return (
                          <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.15 }}
                            className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                              isPopular ? 'ring-2 ring-blue-500 md:scale-105' : ''
                            }`}
                          >
                            {/* Popular badge */}
                            {isPopular && (
                              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                                  <SparklesIcon className="w-4 h-4" />
                                  <span>{t('pricing.popular')}</span>
                                </div>
                              </div>
                            )}

                            <div className="p-8">
                            {/* Plan Header */}
                            <div className="text-center mb-8">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {t(getPlanNameKey(plan.name))}
                              </h3>
                              
                              {getPlanDescriptionKey(plan.name) && (
                                <p className="text-gray-600 mb-4">{t(getPlanDescriptionKey(plan.name)!)}</p>
                              )}

                              {/* Pricing */}
                              <div className="mb-4">
                                <div className="text-4xl font-bold text-gray-900">
                                  €{plan.price.toFixed(2)}
                                </div>
                                <div className="text-gray-600">
                                  / {plan.interval === 'year' ? t('pricing.yearly.short') : t('pricing.monthly.short')}
                                </div>
                                
                                {savings && savings > 0 && billingPeriod === 'yearly' && regularYearlyPrice && (
                                  <div className="text-sm mt-2 text-gray-500">
                                    {t('onboarding.subscription.regularPrice', { 
                                      price: regularYearlyPrice.toFixed(2), 
                                      savings: savings.toFixed(2), 
                                      percent: Math.round((savings / regularYearlyPrice) * 100) 
                                    })}
                                  </div>
                                )}
                                
                                {(plan.trial_days && typeof plan.trial_days === 'number' && plan.trial_days > 0) ? (
                                  <div className="mt-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {t('onboarding.subscription.freeTrialDays', { days: plan.trial_days })}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-8">
                                {/* Solo Plan Features */}
                                {plan.name.toLowerCase().includes('solo') && (
                                  <>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.solo.feature1')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.solo.feature2')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.solo.feature3')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.solo.feature4')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.solo.feature5')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.solo.feature6')}</span>
                                    </li>
                                  </>
                                )}
                                
                                {/* Team Plan Features */}
                                {plan.name.toLowerCase().includes('team') && (
                                  <>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature1')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature2')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature3')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature4')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature5')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature6')}</span>
                                    </li>
                                  </>
                                )}
                                
                                {/* Business Plan Features */}
                                {plan.name.toLowerCase().includes('business') && (
                                  <>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.business.feature1')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.business.feature2')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.business.feature3')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.business.feature4')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.business.feature5')}</span>
                                    </li>
                                  </>
                                )}
                                
                                {/* Pro Plan Features (if not already matched by Team) */}
                                {plan.name.toLowerCase().includes('pro') && !plan.name.toLowerCase().includes('team') && (
                                  <>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature1')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature2')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature3')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature4')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature5')}</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{t('pricing.team.feature6')}</span>
                                    </li>
                                  </>
                                )}
                                
                                {/* Fallback for other plans */}
                                {!plan.name.toLowerCase().includes('solo') && !plan.name.toLowerCase().includes('pro') && !plan.name.toLowerCase().includes('team') && !plan.name.toLowerCase().includes('business') &&
                                  plan.features && plan.features.length > 0 && 
                                  plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start space-x-3">
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700">{feature}</span>
                                    </li>
                                  ))
                                }
                            </ul>

                            {/* Subscribe Button */}
                            <button
                              onClick={() => handlePlanSelect(plan)}
                              className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                                isPopular
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                  : plan.name.toLowerCase().includes('business')
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                              }`}
                            >
                              {t('pricing.cta.freeTrial')}
                            </button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}


              {/* Skip Option */}
              {!plansLoading && !plansError && getAvailablePlans().length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-12"
                >
                  <button
                    onClick={() => setSkipSubscription(true)}
                    className="text-gray-500 hover:text-gray-700 font-medium underline text-lg"
                  >
                    {t('onboarding.subscription.skipForNow')}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNext}
            disabled={creatingBusiness || servicesHook.creating || tablesHook.creating}
            className="flex items-center justify-center space-x-2 px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
          >
            {(creatingBusiness || servicesHook.creating || tablesHook.creating) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {currentStep === 4 
                ? t('onboarding.complete') 
                : t('onboarding.next')
              }
            </span>
            {currentStep < 4 && <ArrowRightIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && createdBusinessId && (
        <PaymentModal
          plan={selectedPlan}
          businessId={createdBusinessId}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default BusinessOnboarding; 