import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  UserIcon,
  ClockIcon,
  ArrowLeftIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useBusiness } from '../../hooks/useBusiness';
import { useBookings, useUpcomingBookings } from '../../hooks/useBookings';
import UpcomingBookings from '../dashboard/UpcomingBookings';
import { BookingStatus } from '../../types';

const BusinessDashboard: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { business, loading: businessLoading, error: businessError } = useBusiness({ bizId: bizId || '' });
  const { bookings, loading: bookingsLoading, searchBookings } = useBookings({ bizId: bizId || '' });

  // Load recent bookings (last 30 days)
  useEffect(() => {
    if (bizId) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      searchBookings({
        date_from: thirtyDaysAgo.toISOString(),
        limit: 100
      });
    }
  }, [bizId, searchBookings]);

  // Calculate metrics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === BookingStatus.confirmed).length;
  const pendingBookings = bookings.filter(b => b.status === BookingStatus.pending).length;
  const completedBookings = bookings.filter(b => b.status === BookingStatus.completed).length;
  const totalRevenue = bookings
    .filter(b => b.status === BookingStatus.completed)
    .reduce((sum, b) => sum + (b.service_price_minor || 0), 0);

  // Calculate today's bookings
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => 
    b.starts_at.split('T')[0] === today
  ).length;

  // Calculate this week's bookings
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const thisWeekBookings = bookings.filter(b => 
    new Date(b.starts_at) >= startOfWeek
  ).length;

  if (!bizId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Business ID Required</h2>
          <p className="text-gray-600 mb-4">A valid business ID is required to view this dashboard.</p>
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

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business dashboard...</p>
        </div>
      </div>
    );
  }

  if (businessError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Business</h2>
          <p className="text-red-600 mb-4">{businessError}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
                <p className="text-sm text-gray-600">Business Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/business/${bizId}/bookings`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                View All Bookings
              </button>
              <button
                onClick={() => navigate(`/business/${bizId}/calendar`)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                Calendar
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => navigate(`/business/${bizId}`)}
                className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate(`/business/${bizId}/settings`)}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                Settings
              </button>
              <button
                onClick={() => navigate(`/business/${bizId}/bookings`)}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                Bookings
              </button>
              <button
                onClick={() => navigate(`/business/${bizId}/calendar`)}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                Calendar
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings (30d)</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                    totalBookings
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                    todaysBookings
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                  ) : (
                    pendingBookings
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CurrencyEuroIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue (30d)</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                  ) : (
                    `€${(totalRevenue / 100).toFixed(2)}`
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2">
            <UpcomingBookings bizId={bizId} />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* This Week */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">This Week</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {bookingsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-5 w-6 rounded"></div>
                    ) : (
                      thisWeekBookings
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confirmed</span>
                  <span className="text-lg font-semibold text-green-600">
                    {bookingsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-5 w-6 rounded"></div>
                    ) : (
                      bookings.filter(b => 
                        new Date(b.starts_at) >= new Date(new Date().setDate(new Date().getDate() - new Date().getDay())) &&
                        b.status === BookingStatus.confirmed
                      ).length
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {bookingsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-5 w-6 rounded"></div>
                    ) : (
                      bookings.filter(b => 
                        new Date(b.starts_at) >= new Date(new Date().setDate(new Date().getDate() - new Date().getDay())) &&
                        b.status === BookingStatus.completed
                      ).length
                    )}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/business/${bizId}/bookings`)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <PlusIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">New Booking</p>
                      <p className="text-sm text-gray-500">Create a new reservation</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate(`/business/${bizId}/calendar`)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">View Calendar</p>
                      <p className="text-sm text-gray-500">See upcoming schedules</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate(`/business/${bizId}/settings`)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Settings</p>
                      <p className="text-sm text-gray-500">Configure business</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard; 