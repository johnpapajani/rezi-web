import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { serviceApi } from '../../utils/api';
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
  const { t } = useTranslation();
  
  const [service, setService] = useState<ServiceData | null>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Service</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Dashboard
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                service.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {service.is_active ? (
                  <>
                    <EyeIcon className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-3 h-3 mr-1" />
                    Inactive
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
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange('bookings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => handleTabChange('tables')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'tables'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => handleTabChange('availability')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
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
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{formatDuration(service.duration_minutes)}</p>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {service.price_minor > 0 ? formatPrice(service.price_minor) : 'Free'}
                  </p>
                  <p className="text-sm text-gray-600">Base Price</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <RectangleGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{tables.length}</p>
                  <p className="text-sm text-gray-600">Tables</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <CalendarDaysIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{confirmedBookings}</p>
                  <p className="text-sm text-gray-600">Confirmed Bookings</p>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
                <button
                  onClick={() => handleTabChange('bookings')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              {bookings.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No bookings yet</p>
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
                        <p className="text-sm font-medium text-gray-900">{booking.party_size} guests</p>
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
                <h2 className="text-lg font-medium text-gray-900">Tables</h2>
                <button
                  onClick={() => handleTabChange('tables')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Tables
                </button>
              </div>
              {tables.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No tables configured yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.slice(0, 6).map((table) => (
                    <div key={table.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{table.code}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          table.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {table.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{table.seats} seats</p>
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
              <h2 className="text-lg font-medium text-gray-900 mb-4">Bookings Management</h2>
              <p className="text-gray-600">Bookings management interface will be implemented here.</p>
            </div>
          </motion.div>
        )}

        {currentTab === 'tables' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tables Management</h2>
              <p className="text-gray-600">Tables management interface will be implemented here.</p>
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
              <h2 className="text-lg font-medium text-gray-900 mb-4">Availability Management</h2>
              <p className="text-gray-600">Availability management interface will be implemented here.</p>
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
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service Settings</h2>
              <p className="text-gray-600">Service settings interface will be implemented here.</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ServiceManagementDashboard; 