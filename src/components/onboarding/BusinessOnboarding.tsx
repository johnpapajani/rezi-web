import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBusinessCreate } from '../../hooks/useBusinessCreate';
import { useServices } from '../../hooks/useServices';
import { useTables } from '../../hooks/useTables';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import { useTranslation } from '../../hooks/useTranslation';
import { BusinessCreate, ServiceCreate, TableCreate, ServiceOpenIntervalCreate } from '../../types';
import { serviceApi } from '../../utils/api';
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
import { Weekday } from '../../types';

const BusinessOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { creating: creatingBusiness, error: businessError, createBusiness, clearError } = useBusinessCreate();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useServiceCategories();

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

  // Step 3: Tables - Change from service index mapping to service ID mapping
  const [tables, setTables] = useState<{ [serviceIndex: number]: TableCreate[] }>({});
  const [createdServices, setCreatedServices] = useState<any[]>([]);
  const [serviceToTablesMap, setServiceToTablesMap] = useState<{ [serviceId: string]: TableCreate[] }>({});

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Business creation status
  const [currentError, setCurrentError] = useState<string | null>(null);

  // Refresh categories when reaching step 2 (services) to ensure current language
  useEffect(() => {
    if (currentStep === 2) {
      refetchCategories();
    }
  }, [currentStep, refetchCategories]);

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

  const steps = [
    { number: 1, title: t('onboarding.steps.business.title'), description: t('onboarding.steps.business.description') },
    { number: 2, title: t('onboarding.steps.services.title'), description: t('onboarding.steps.services.description') },
    { number: 3, title: t('onboarding.steps.tables.title'), description: t('onboarding.steps.tables.description') },
  ];

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
    // Check if any services have tables configured
    const totalTables = Object.values(tables).reduce((sum, serviceTables) => sum + (serviceTables?.length || 0), 0);
    console.log('Validating tables configuration:', {
      totalTables,
      tablesState: tables,
      servicesCount: services.length
    });
    
    // Tables are optional - if no tables are configured, that's fine
    // Just log for debugging purposes
    if (totalTables === 0) {
      console.log('No tables configured for any service - this is optional');
    } else {
      console.log(`Found ${totalTables} tables configured across ${services.length} services`);
    }
    
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

  const handleServiceHoursChange = (serviceIndex: number, dayIndex: number, field: string, value: any) => {
    setServices(prev => prev.map((service, i) => 
      i === serviceIndex 
        ? {
            ...service,
            open_intervals: service.open_intervals?.map((hours, j) =>
              j === dayIndex ? { ...hours, [field]: value } : hours
            ) || []
          }
        : service
    ));
  };

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
      open_intervals: defaultServiceIntervals,
    }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const addTable = (serviceIndex: number) => {
    if (serviceIndex < 0 || serviceIndex >= services.length) {
      return;
    }
    
    setTables(prev => {
      const currentTablesForService = prev[serviceIndex] || [];
      const newTableCode = `T${currentTablesForService.length + 1}`;
      
      const newTable: TableCreate = {
        service_id: '', // Will be set after service creation
        code: newTableCode,
        seats: 4,
        is_active: true,
      };
      
      return {
        ...prev,
        [serviceIndex]: [...currentTablesForService, newTable]
      };
    });
  };

  const removeTable = (serviceIndex: number, tableIndex: number) => {
    setTables(prev => ({
      ...prev,
      [serviceIndex]: prev[serviceIndex]?.filter((_, i) => i !== tableIndex) || []
    }));
  };

  const handleTableChange = (serviceIndex: number, tableIndex: number, field: string, value: any) => {
    setTables(prev => ({
      ...prev,
      [serviceIndex]: prev[serviceIndex]?.map((table, i) =>
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
        
        // Map tables from service indices to actual service IDs
        const newServiceToTablesMap: { [serviceId: string]: TableCreate[] } = {};
        
        createdServicesList.forEach((createdService, index) => {
          if (tables[index] && tables[index].length > 0) {
            newServiceToTablesMap[createdService.id] = tables[index];
          }
        });
        
        setServiceToTablesMap(newServiceToTablesMap);

        
        setCurrentStep(3);

      } else if (currentStep === 3) {
        if (!createdBusinessId) {
          setGlobalError(t('onboarding.errors.businessNotCreatedStartOver'));
          return;
        }

        // Check if there are any tables to create
        let totalTables = Object.values(serviceToTablesMap).reduce((sum, serviceTables) => sum + (serviceTables?.length || 0), 0);

        // Backup fix: If serviceToTablesMap is empty but we have tables in state, rebuild the mapping
        if (totalTables === 0 && Object.values(tables).some(serviceTables => serviceTables && serviceTables.length > 0)) {
          const backupServiceToTablesMap: { [serviceId: string]: TableCreate[] } = {};
          let backupTotalTablesFound = 0;
          
          createdServices.forEach((createdService, index) => {
            if (tables[index] && tables[index].length > 0) {
              backupServiceToTablesMap[createdService.id] = tables[index];
              backupTotalTablesFound += tables[index].length;
            }
          });
          
          setServiceToTablesMap(backupServiceToTablesMap);
          
          // Update working variables for the rest of the function
          totalTables = backupTotalTablesFound;
          
          // Use the backup mapping directly since state updates are async
          Object.assign(serviceToTablesMap, backupServiceToTablesMap);
        }

        if (totalTables === 0) {
          setShowSuccess(true);
          setTimeout(() => {
            navigate(`/business/${createdBusinessId}`);
          }, 2000);
          return;
        }

        // Create tables for each service using the reliable mapping
        let tablesCreated = 0;
        let tablesFailures = 0;
        const failureDetails: string[] = [];
        
        for (const [serviceId, serviceTables] of Object.entries(serviceToTablesMap)) {
          if (serviceTables && serviceTables.length > 0) {
            for (let i = 0; i < serviceTables.length; i++) {
              const tableData = serviceTables[i];
              
                              try {
                  // Validate table data
                  if (!tableData.code?.trim()) {
                    const error = `Table code is empty for service ${serviceId}`;
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
                  
                  if (!serviceId) {
                    const error = `Service ID is missing for table ${tableData.code}`;
                    failureDetails.push(error);
                    tablesFailures++;
                    continue;
                  }
                  
                  // Set the correct service_id before creating the table
                  const tableWithServiceId: TableCreate = { 
                    service_id: serviceId,
                    code: tableData.code.trim(),
                    seats: seats, // Use the validated seats value
                    merge_group: tableData.merge_group?.trim() || undefined,
                    is_active: tableData.is_active !== false
                  };
                  
                  const createdTable = await serviceApi.addServiceTable(serviceId, tableWithServiceId);
                  tablesCreated++;
                } catch (error: any) {
                  tablesFailures++;
                
                                  const errorMessage = error?.detail || error?.message || JSON.stringify(error);
                  const fullError = `Failed to create table ${tableData.code} for service ${serviceId}: ${errorMessage}`;
                  failureDetails.push(fullError);
                }
              }
            }
          }

        if (tablesFailures > 0 && tablesCreated === 0) {
          setGlobalError(`Failed to create any tables. Errors: ${failureDetails.slice(0, 3).join('; ')}${failureDetails.length > 3 ? '...' : ''}`);
          return;
        }
        
        if (tablesFailures > 0) {
          setGlobalError(`Warning: ${tablesFailures} table(s) failed to create. ${tablesCreated} created successfully.`);
        }

        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/business/${createdBusinessId}`);
        }, 2000);
      }

    } catch (error: any) {
      setGlobalError(error.detail || t('onboarding.errors.genericError'));
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required={true}
                        value={businessData.city}
                        onChange={handleBusinessInputChange}
                        placeholder={t('business.fields.city.placeholder')}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
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
                  {services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-medium text-gray-900">{service.name}</h3>
                        <button
                          onClick={() => addTable(serviceIndex)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          {t('onboarding.addTable')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(tables[serviceIndex] || []).map((table, tableIndex) => (
                          <div key={tableIndex} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                {t('onboarding.table')} {tableIndex + 1}
                              </h4>
                              <button
                                onClick={() => removeTable(serviceIndex, tableIndex)}
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
                                  onChange={(e) => handleTableChange(serviceIndex, tableIndex, 'code', e.target.value)}
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
                                  onChange={(e) => handleTableChange(serviceIndex, tableIndex, 'seats', parseInt(e.target.value) || '')}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="1"
                                  placeholder="1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {(!tables[serviceIndex] || tables[serviceIndex].length === 0) && (
                        <div className="text-center py-6 text-gray-500">
                          <RectangleGroupIcon className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">{t('onboarding.noTables')}</p>
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