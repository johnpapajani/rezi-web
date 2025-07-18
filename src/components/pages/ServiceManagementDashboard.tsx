import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { serviceApi } from '../../utils/api';
import { Table, TableCreate, TableUpdate } from '../../types';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  RectangleGroupIcon,
  CogIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ServiceData {
  id: string;
  business_id: string;
  business_name: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_minor: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type TabType = 'dashboard' | 'bookings' | 'tables' | 'availability' | 'settings';

const ServiceManagementDashboard: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  
  const [service, setService] = useState<ServiceData | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  
  // Table management state
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);
  const [tableFormData, setTableFormData] = useState<TableCreate>({
    service_id: serviceId || '',
    code: '',
    seats: 2,
    merge_group: '',
    is_active: true
  });
  const [tableOperationLoading, setTableOperationLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch service details, tables, and recent bookings
      const [serviceData, tablesData, bookingsData] = await Promise.all([
        serviceApi.getServiceDetails(serviceId!),
        serviceApi.getServiceTables(serviceId!),
        serviceApi.getServiceBookings(serviceId!, { limit: 10 })
      ]);

      setService(serviceData);
      setTables(tablesData);
      setBookings(bookingsData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch service data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceMinor: number): string => {
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ALL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
  };

  // Table management handlers
  const refreshTables = async () => {
    if (!serviceId) return;
    try {
      const tablesData = await serviceApi.getServiceTables(serviceId);
      setTables(tablesData);
    } catch (err: any) {
      setTableError(err.detail || 'Failed to refresh tables');
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) return;
    
    try {
      setTableOperationLoading(true);
      setTableError(null);
      await serviceApi.addServiceTable(serviceId, tableFormData);
      await refreshTables();
      setIsCreateTableModalOpen(false);
      setTableFormData({
        service_id: serviceId,
        code: '',
        seats: 2,
        merge_group: '',
        is_active: true
      });
    } catch (err: any) {
      setTableError(err.detail || 'Failed to create table');
    } finally {
      setTableOperationLoading(false);
    }
  };

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !editingTable) return;
    
    try {
      setTableOperationLoading(true);
      setTableError(null);
      const updateData: TableUpdate = {
        code: tableFormData.code,
        seats: tableFormData.seats,
        merge_group: tableFormData.merge_group,
        is_active: tableFormData.is_active
      };
      await serviceApi.updateServiceTable(serviceId, editingTable.id, updateData);
      await refreshTables();
      setEditingTable(null);
      setTableFormData({
        service_id: serviceId,
        code: '',
        seats: 2,
        merge_group: '',
        is_active: true
      });
    } catch (err: any) {
      setTableError(err.detail || 'Failed to update table');
    } finally {
      setTableOperationLoading(false);
    }
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setTableFormData({
      service_id: serviceId || '',
      code: table.code,
      seats: table.seats,
      merge_group: table.merge_group || '',
      is_active: table.is_active
    });
    setTableError(null);
  };

  const closeModals = () => {
    setIsCreateTableModalOpen(false);
    setEditingTable(null);
    setDeletingTable(null);
    setTableError(null);
    setTableFormData({
      service_id: serviceId || '',
      code: '',
      seats: 2,
      merge_group: '',
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('serviceManagement.loadingService')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('serviceManagement.errorLoadingService')}</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('serviceDashboard.returnToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('serviceManagement.serviceNotFound')}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('serviceDashboard.returnToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (service.price_minor * b.party_size), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">{service.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {service.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {service.business_name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                service.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {service.is_active ? (
                  <>
                    <EyeIcon className="w-3 h-3 mr-1" />
                    {t('common.active')}
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-3 h-3 mr-1" />
                    {t('common.inactive')}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('common.dashboard')}
            </button>
            <button
              onClick={() => handleTabChange('bookings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('serviceManagement.tabs.bookings')}
            </button>
            <button
              onClick={() => handleTabChange('tables')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'tables'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('serviceManagement.tabs.tables')}
            </button>
            <button
              onClick={() => handleTabChange('availability')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('serviceManagement.tabs.availability')}
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('common.settings')}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {currentTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Service Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('serviceManagement.overview.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{formatDuration(service.duration_minutes)}</p>
                  <p className="text-sm text-gray-600">{t('common.duration')}</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {service.price_minor > 0 ? formatPrice(service.price_minor) : t('common.free')}
                  </p>
                  <p className="text-sm text-gray-600">{t('serviceManagement.overview.basePrice')}</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <RectangleGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{tables.length}</p>
                  <p className="text-sm text-gray-600">{t('serviceManagement.overview.tables')}</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <CalendarDaysIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{confirmedBookings}</p>
                  <p className="text-sm text-gray-600">{t('serviceManagement.overview.confirmedBookings')}</p>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">{t('serviceManagement.recentBookings.title')}</h2>
                <button
                  onClick={() => handleTabChange('bookings')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('serviceManagement.recentBookings.viewAll')}
                </button>
              </div>
              {bookings.length === 0 ? (
                <p className="text-gray-600 text-center py-8">{t('serviceManagement.recentBookings.noBookings')}</p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.starts_at).toLocaleDateString()} at{' '}
                          {new Date(booking.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{booking.party_size} {t('serviceManagement.recentBookings.guests')}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tables Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">{t('serviceManagement.tables.title')}</h2>
                <button
                  onClick={() => handleTabChange('tables')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('serviceManagement.tables.manageTables')}
                </button>
              </div>
              {tables.length === 0 ? (
                <p className="text-gray-600 text-center py-8">{t('serviceManagement.tables.noTables')}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.slice(0, 6).map((table) => (
                    <div key={table.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{table.code}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          table.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {table.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{table.seats} {t('serviceManagement.tables.seats')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('serviceManagement.bookingsManagement.title')}</h2>
              <p className="text-gray-600">{t('serviceManagement.bookingsManagement.description')}</p>
            </div>
          </motion.div>
        )}

        {currentTab === 'tables' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Error Display */}
            {tableError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">Error: {tableError}</span>
                </div>
              </div>
            )}

            {/* Tables Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {t('serviceManagement.tablesManagement.title')} ({tables.length})
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('tables.subtitle')}
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateTableModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {t('tables.addTable')}
                </button>
              </div>

              {tables.length === 0 ? (
                <div className="text-center py-12">
                  <RectangleGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('serviceManagement.tables.noTables')}</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first table for this service.</p>
                  <button
                    onClick={() => setIsCreateTableModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {t('tables.addTable')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {tables.map((table) => (
                    <motion.div
                      key={table.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${table.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <h3 className="text-lg font-medium text-gray-900">{table.code}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(table)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTable(table)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Seats:</span>
                          <span className="text-sm font-medium text-gray-900">{table.seats}</span>
                        </div>
                        {table.merge_group && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Group:</span>
                            <span className="text-sm font-medium text-gray-900">{table.merge_group}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            table.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {table.is_active ? t('common.active') : t('common.inactive')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentTab === 'availability' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('serviceManagement.availabilityManagement.title')}</h2>
              <p className="text-gray-600">{t('serviceManagement.availabilityManagement.description')}</p>
            </div>
          </motion.div>
        )}

        {currentTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('serviceManagement.serviceSettings.title')}</h2>
              <p className="text-gray-600">{t('serviceManagement.serviceSettings.description')}</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Create/Edit Table Modal */}
      <AnimatePresence>
        {(isCreateTableModalOpen || editingTable) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModals}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTable ? t('tables.editTable') : t('tables.createTable')}
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {tableError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                    <span className="text-red-800 text-sm">{tableError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={editingTable ? handleUpdateTable : handleCreateTable} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tables.tableCode')}
                  </label>
                  <input
                    type="text"
                    value={tableFormData.code}
                    onChange={(e) => setTableFormData({ ...tableFormData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="T1, A01, VIP1..."
                    required
                    maxLength={40}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    A unique identifier for this table (e.g., T1, A01, VIP1)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tables.seats')}
                  </label>
                  <input
                    type="number"
                    value={tableFormData.seats}
                    onChange={(e) => setTableFormData({ ...tableFormData, seats: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Number of people this table can accommodate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tables.mergeGroup')}
                  </label>
                  <input
                    type="text"
                    value={tableFormData.merge_group}
                    onChange={(e) => setTableFormData({ ...tableFormData, merge_group: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional group name..."
                    maxLength={40}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Group tables that can be combined for larger parties
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={tableFormData.is_active}
                    onChange={(e) => setTableFormData({ ...tableFormData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    {t('tables.active')}
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('tables.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={tableOperationLoading}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tableOperationLoading ? t('tables.saving') : (editingTable ? t('tables.update') : t('tables.create'))}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeletingTable(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Deactivate Table
                </h3>
                <button
                  onClick={() => setDeletingTable(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to deactivate table <strong>{deletingTable.code}</strong>? 
                  This will make it unavailable for new bookings, but existing bookings will remain unchanged.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  You can reactivate it later by editing the table.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeletingTable(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!serviceId || !deletingTable) return;
                    try {
                      setTableOperationLoading(true);
                      await serviceApi.updateServiceTable(serviceId, deletingTable.id, { is_active: false });
                      await refreshTables();
                      setDeletingTable(null);
                    } catch (err: any) {
                      setTableError(err.detail || 'Failed to deactivate table');
                    } finally {
                      setTableOperationLoading(false);
                    }
                  }}
                  disabled={tableOperationLoading}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tableOperationLoading ? 'Deactivating...' : 'Deactivate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceManagementDashboard; 