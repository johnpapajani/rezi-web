import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals, Weekday } from '../../types';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const PublicBusinessPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<ServiceWithOpenIntervals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const [businessData, servicesData] = await Promise.all([
          publicApi.getBusinessDetails(slug),
          publicApi.getBusinessServices(slug)
        ]);
        
        setBusiness(businessData);
        setServices(servicesData);
      } catch (err: any) {
        setError(err.detail || 'Failed to load business information');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [slug]);

  const formatPrice = (priceMinor: number, currency: string = 'ALL') => {
    const price = priceMinor / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatOpenIntervals = (intervals: any[]) => {
    if (!intervals || intervals.length === 0) return 'Hours not specified';

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayMap: { [key: number]: string[] } = {};

    intervals.forEach(interval => {
      const dayIndex = interval.weekday - 1; // Convert 1-7 to 0-6
      if (!dayMap[dayIndex]) dayMap[dayIndex] = [];
      dayMap[dayIndex].push(`${interval.start_time} - ${interval.end_time}`);
    });

    return Object.entries(dayMap)
      .map(([dayIndex, times]) => `${weekdays[parseInt(dayIndex)]}: ${times.join(', ')}`)
      .join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The business you are looking for does not exist.'}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Book Online</h1>
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Business Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Business Logo & Info */}
            <div className="lg:col-span-1">
              <div className="text-center lg:text-left">
                {business.logo_url && (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="h-24 w-24 mx-auto lg:mx-0 rounded-lg object-cover"
                  />
                )}
                <h1 className="mt-4 text-3xl font-bold text-gray-900">{business.name}</h1>
                
                {/* Address */}
                {(business.address_line1 || business.city) && (
                  <div className="mt-4 flex items-start justify-center lg:justify-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-gray-600">
                      {business.address_line1 && <div>{business.address_line1}</div>}
                      {business.address_line2 && <div>{business.address_line2}</div>}
                      {business.city && (
                        <div>
                          {business.city}
                          {business.postal_code && `, ${business.postal_code}`}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 lg:mt-0 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-600 mx-auto" />
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">Easy Booking</h3>
                  <p className="text-gray-600 text-sm">Book your appointment online</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <ClockIcon className="h-8 w-8 text-green-600 mx-auto" />
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">Instant Confirmation</h3>
                  <p className="text-gray-600 text-sm">Get confirmed immediately</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <StarIcon className="h-8 w-8 text-purple-600 mx-auto" />
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">Quality Service</h3>
                  <p className="text-gray-600 text-sm">Professional and reliable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Services</h2>
          <p className="text-gray-600">Choose a service to check availability and book your appointment.</p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600">This business hasn't added any services yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        {formatPrice(service.price_minor, business.currency)}
                      </div>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {service.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{service.duration_min} minutes</span>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  {service.open_intervals && service.open_intervals.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Operating Hours:</p>
                      <div className="text-xs text-gray-600 whitespace-pre-line">
                        {formatOpenIntervals(service.open_intervals)}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/book/${slug}/service/${service.id}`)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 {business.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicBusinessPage; 