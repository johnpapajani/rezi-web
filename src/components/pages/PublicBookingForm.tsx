import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals, Table, BookingCreate } from '../../types';
import { 
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface BookingData {
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  partySize: number;
}

const PublicBookingForm: React.FC = () => {
  const { slug, serviceId } = useParams<{ slug: string; serviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data passed from the previous page
  const { bookingData, service, business } = location.state as {
    bookingData: BookingData;
    service: ServiceWithOpenIntervals;
    business: Business;
  } || {};

  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Redirect if no booking data
    if (!bookingData || !service || !business) {
      navigate(`/book/${slug}/service/${serviceId}`);
      return;
    }

    const fetchTables = async () => {
      try {
        setTablesLoading(true);
        const tablesData = await publicApi.getServiceTables(slug!, serviceId!);
        // Filter tables that can accommodate the party size
        const suitableTables = tablesData.filter(table => table.seats >= bookingData.partySize);
        setTables(suitableTables);
        
        // Auto-select the first suitable table
        if (suitableTables.length > 0) {
          setSelectedTable(suitableTables[0]);
        }
      } catch (err: any) {
        setError(err.detail || 'Failed to load tables');
      } finally {
        setTablesLoading(false);
      }
    };

    fetchTables();
  }, [slug, serviceId, bookingData, service, business, navigate]);

  const formatPrice = (priceMinor: number, currency: string = 'ALL') => {
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!customerData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!customerData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(customerData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (customerData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!selectedTable) {
      errors.table = 'Please select a table';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!selectedTable || !bookingData) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingRequest: BookingCreate = {
        service_id: bookingData.serviceId,
        table_id: selectedTable.id,
        starts_at: bookingData.startTime,
        ends_at: bookingData.endTime,
        party_size: bookingData.partySize,
        customer: {
          name: customerData.name.trim(),
          phone: customerData.phone.trim(),
          email: customerData.email.trim() || undefined
        }
      };

      const booking = await publicApi.createBooking(slug!, bookingRequest);
      
      // Navigate to confirmation page
      navigate(`/book/confirmation/${booking.id}`, {
        state: { booking, service, business }
      });
    } catch (err: any) {
      setError(err.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!bookingData || !service || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link 
              to={`/book/${slug}/service/${serviceId}`}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Complete Your Booking</h1>
              <p className="text-gray-600 text-sm">{business.name} • {service.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(bookingData.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
                    </p>
                    <p className="text-sm text-gray-600">{service.duration_min} minutes</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingData.partySize} {bookingData.partySize === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(service.price_minor, business.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {service.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Service Details</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={customerData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`
                          w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500
                          ${validationErrors.name ? 'border-red-300' : 'border-gray-300'}
                        `}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`
                          w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500
                          ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'}
                        `}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`
                          w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500
                          ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}
                        `}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Selection */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Table</h2>
                
                {tablesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : tables.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tables.map((table) => (
                        <div
                          key={table.id}
                          onClick={() => setSelectedTable(table)}
                          className={`
                            p-4 border rounded-lg cursor-pointer transition-colors
                            ${selectedTable?.id === table.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">Table {table.code}</h3>
                              <p className="text-sm text-gray-600">
                                Seats up to {table.seats} {table.seats === 1 ? 'person' : 'people'}
                              </p>
                            </div>
                            {selectedTable?.id === table.id && (
                              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {validationErrors.table && (
                      <p className="mt-2 text-sm text-red-600">{validationErrors.table}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No suitable tables available for a party of {bookingData.partySize}.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please go back and select a smaller party size.
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <button
                  type="submit"
                  disabled={loading || tables.length === 0}
                  className={`
                    w-full py-3 px-4 rounded-md font-medium transition-colors duration-200
                    ${loading || tables.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </div>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  By confirming, you agree to our terms and conditions.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingForm; 