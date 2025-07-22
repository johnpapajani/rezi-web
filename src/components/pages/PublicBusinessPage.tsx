import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../../utils/api';
import { Business, ServiceWithOpenIntervals } from '../../types';
import { 
  ClockIcon,
  MapPinIcon
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Business Info */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {business.logo_url && (
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-20 w-20 mx-auto rounded-lg object-cover mb-6"
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{business.name}</h1>
          
          {/* Address */}
          {(business.address_line1 || business.city) && (
            <div className="flex items-center justify-center text-gray-600 mb-8">
              <MapPinIcon className="h-4 w-4 mr-2 text-blue-500" />
              <div>
                {business.address_line1 && <span>{business.address_line1}</span>}
                {business.address_line2 && <span>, {business.address_line2}</span>}
                {business.city && (
                  <span>
                    {business.address_line1 && ', '}{business.city}
                    {business.postal_code && ` ${business.postal_code}`}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Services</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded"></div>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No services available at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-gray-600 mb-3">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{service.duration_min} min</span>
                      </div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatPrice(service.price_minor, business.currency)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/book/${slug}/service/${service.id}`)}
                    className="ml-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PublicBusinessPage; 