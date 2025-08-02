import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { serviceApi } from '../../utils/api';
import { 
  SessionWithBookings, 
  SessionCreate, 
  SessionUpdate, 
  SessionStatus, 
  SessionListFilters, 
  SessionAnalytics,
  Table 
} from '../../types';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  ChartBarIcon,
  RectangleGroupIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ServiceSessionsManagementProps {
  serviceId: string;
  serviceName: string;
  tables: Table[];
  businessTimezone: string;
  onEventSelect?: (event: SessionWithBookings) => void;
}

const ServiceSessionsManagement: React.FC<ServiceSessionsManagementProps> = ({
  serviceId,
  serviceName,
  tables,
  businessTimezone,
  onEventSelect,
}) => {
  const { t } = useTranslation();
  
  // State for sessions data
  const [sessions, setSessions] = useState<SessionWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionWithBookings | null>(null);
  const [deletingSession, setDeletingSession] = useState<SessionWithBookings | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<SessionCreate>({
    service_id: serviceId,
    name: '',
    start_time: '',
    end_time: '',
    capacity: 1,
    table_id: '',
    is_available: true,
    is_recurring: false,
    status: SessionStatus.scheduled,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<SessionListFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionsData = await serviceApi.getServiceSessions(serviceId, filters);
      setSessions(sessionsData);
    } catch (err: any) {
      setError(err.detail || err.message || t('sessions.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [serviceId, filters, t]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const analyticsData = await serviceApi.getServiceSessionAnalytics(serviceId);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
    }
  }, [serviceId]);

  // Fetch sessions on mount and when filters change
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validation
    if (!formData.name?.trim()) {
      setFormError(t('sessions.validation.nameRequired'));
      return;
    }
    
    if (!formData.start_time || !formData.end_time) {
      setFormError(t('sessions.validation.timesRequired'));
      return;
    }
    
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      setFormError(t('sessions.validation.endTimeAfterStart'));
      return;
    }
    
    if (formData.capacity <= 0) {
      setFormError(t('sessions.validation.capacityRequired'));
      return;
    }

    try {
      setCreating(true);
      const newSession = await serviceApi.createServiceSession(serviceId, formData);
      setSessions(prev => [...prev, newSession]);
      setIsCreateModalOpen(false);
      resetForm();
      fetchAnalytics(); // Refresh analytics
    } catch (err: any) {
      setFormError(err.detail || err.message || t('sessions.error.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    
    setFormError(null);
    
    // Build update data with only changed fields
    const updateData: SessionUpdate = {};
    
    if (formData.name !== editingSession.name) updateData.name = formData.name;
    if (formData.start_time !== editingSession.start_time) updateData.start_time = formData.start_time;
    if (formData.end_time !== editingSession.end_time) updateData.end_time = formData.end_time;
    if (formData.capacity !== editingSession.capacity) updateData.capacity = formData.capacity;
    if (formData.table_id !== editingSession.table_id) updateData.table_id = formData.table_id || undefined;
    if (formData.is_available !== editingSession.is_available) updateData.is_available = formData.is_available;
    if (formData.status !== editingSession.status) updateData.status = formData.status;
    
    // Validation for time changes
    if (updateData.start_time || updateData.end_time) {
      const startTime = updateData.start_time || editingSession.start_time;
      const endTime = updateData.end_time || editingSession.end_time;
      
      if (new Date(startTime) >= new Date(endTime)) {
        setFormError(t('sessions.validation.endTimeAfterStart'));
        return;
      }
    }

    try {
      setUpdating(true);
      const updatedSession = await serviceApi.updateServiceSession(serviceId, editingSession.id, updateData);
      setSessions(prev => prev.map(s => s.id === editingSession.id ? updatedSession : s));
      setEditingSession(null);
      resetForm();
      fetchAnalytics(); // Refresh analytics
    } catch (err: any) {
      setFormError(err.detail || err.message || t('sessions.error.updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSession = async (force: boolean = false) => {
    if (!deletingSession) return;

    try {
      setDeleting(true);
      await serviceApi.deleteServiceSession(serviceId, deletingSession.id, force);
      setSessions(prev => prev.filter(s => s.id !== deletingSession.id));
      setDeletingSession(null);
      fetchAnalytics(); // Refresh analytics
    } catch (err: any) {
      setError(err.detail || err.message || t('sessions.error.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: serviceId,
      name: '',
      start_time: '',
      end_time: '',
      capacity: 1,
      table_id: '',
      is_available: true,
      is_recurring: false,
      status: SessionStatus.scheduled,
    });
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (session: SessionWithBookings) => {
    setFormData({
      service_id: serviceId,
      name: session.name || '',
      start_time: session.start_time,
      end_time: session.end_time,
      capacity: session.capacity,
      table_id: session.table_id || '',
      is_available: session.is_available,
      is_recurring: session.is_recurring,
      status: session.status,
    });
    setEditingSession(session);
  };

  const formatDateTime = (dateTimeString: string): { date: string; time: string } => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };



  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.scheduled:
        return 'bg-green-100 text-green-800';
      case SessionStatus.cancelled:
        return 'bg-red-100 text-red-800';
      case SessionStatus.completed:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      session.name?.toLowerCase().includes(searchLower) ||
      session.table_code?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('sessions.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Analytics Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('sessions.title')}</h2>
          <p className="text-sm text-gray-600">{t('sessions.subtitle').replace('{serviceName}', serviceName)}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {analytics && (
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              {showAnalytics ? t('sessions.hideAnalytics') : t('sessions.showAnalytics')}
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            {t('sessions.filters')}
          </button>
          
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('sessions.create')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && analytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sessions.analytics.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.total_sessions}</div>
                <div className="text-sm text-gray-600">{t('sessions.analytics.totalSessions')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.scheduled_sessions}</div>
                <div className="text-sm text-gray-600">{t('sessions.analytics.scheduledSessions')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics.total_bookings}</div>
                <div className="text-sm text-gray-600">{t('sessions.analytics.totalBookings')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(analytics.average_utilization * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">{t('sessions.analytics.utilization')}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg border border-gray-200 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessions.filters.search')}
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('sessions.filters.searchPlaceholder')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessions.filters.status')}
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as SessionStatus || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('sessions.filters.allStatuses')}</option>
                  <option value={SessionStatus.scheduled}>{t('sessions.status.scheduled')}</option>
                  <option value={SessionStatus.cancelled}>{t('sessions.status.cancelled')}</option>
                  <option value={SessionStatus.completed}>{t('sessions.status.completed')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessions.filters.table')}
                </label>
                <select
                  value={filters.table_id || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, table_id: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('sessions.filters.allTables')}</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>{table.code}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sessions.filters.availability')}
                </label>
                <select
                  value={filters.is_available?.toString() || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    is_available: e.target.value === '' ? undefined : e.target.value === 'true'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('sessions.filters.allAvailability')}</option>
                  <option value="true">{t('sessions.available')}</option>
                  <option value="false">{t('sessions.unavailable')}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('sessions.noSessions.title')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('sessions.noSessions.description')}</p>
          <div className="mt-6">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {t('sessions.createFirst')}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {t('sessions.list.title')} ({filteredSessions.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredSessions.map((session) => {
              const startDateTime = formatDateTime(session.start_time);
              const endDateTime = formatDateTime(session.end_time);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${onEventSelect ? 'cursor-pointer' : ''}`}
                  onClick={() => onEventSelect && onEventSelect(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {session.name || t('sessions.unnamedSession')}
                        </h4>
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {t(`sessions.status.${session.status}`)}
                        </span>
                        
                        {session.is_available ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <EyeIcon className="w-3 h-3 mr-1" />
                            {t('sessions.available')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeSlashIcon className="w-3 h-3 mr-1" />
                            {t('sessions.unavailable')}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                          <span>{startDateTime.date}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>{startDateTime.time} - {endDateTime.time}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="w-4 h-4 text-gray-400" />
                          <span>
                            {session.total_bookings}/{session.capacity} {t('sessions.booked')}
                            {session.seats_left > 0 && (
                              <span className="text-green-600 ml-1">
                                ({session.seats_left} {t('sessions.available')})
                              </span>
                            )}
                          </span>
                        </div>
                        
                        {session.table_code && (
                          <div className="flex items-center space-x-2">
                            <RectangleGroupIcon className="w-4 h-4 text-gray-400" />
                            <span>{session.table_code}</span>
                          </div>
                        )}
                      </div>
                      
                      {(session.confirmed_bookings > 0 || session.pending_bookings > 0) && (
                        <div className="mt-2 text-sm">
                          <span className="text-green-600 font-medium">{session.confirmed_bookings} {t('sessions.confirmed')}</span>
                          {session.pending_bookings > 0 && (
                            <span className="text-orange-600 font-medium ml-3">
                              {session.pending_bookings} {t('sessions.pending')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => openEditModal(session)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('sessions.edit')}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setDeletingSession(session)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('sessions.delete')}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create/Edit Session Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || editingSession) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingSession ? t('sessions.editSession') : t('sessions.createSession')}
                </h3>
              </div>

              <form onSubmit={editingSession ? handleUpdateSession : handleCreateSession} className="p-6 space-y-6">
                {formError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-medium">{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('sessions.form.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('sessions.form.namePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('sessions.form.startTime')} *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('sessions.form.endTime')} *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('sessions.form.capacity')} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('sessions.form.table')}
                    </label>
                    <select
                      value={formData.table_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, table_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('sessions.form.noTable')}</option>
                      {tables.filter(table => table.is_active).map(table => (
                        <option key={table.id} value={table.id}>
                          {table.code} ({table.seats} {t('sessions.seats')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('sessions.form.status')}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SessionStatus }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={SessionStatus.scheduled}>{t('sessions.status.scheduled')}</option>
                      <option value={SessionStatus.cancelled}>{t('sessions.status.cancelled')}</option>
                      <option value={SessionStatus.completed}>{t('sessions.status.completed')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_available"
                        checked={formData.is_available}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                        {t('sessions.form.isAvailable')}
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('sessions.form.isAvailableHelp')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingSession(null);
                      resetForm();
                    }}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    {(creating || updating) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {editingSession ? t('sessions.update') : t('sessions.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {t('sessions.deleteConfirm.title')}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {t('sessions.deleteConfirm.message').replace('{sessionName}', deletingSession.name || t('sessions.unnamedSession'))}
                </p>
                
                {deletingSession.total_bookings > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <div className="flex items-center space-x-2">
                      <InformationCircleIcon className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        {t('sessions.deleteConfirm.hasBookings').replace('{count}', deletingSession.total_bookings.toString())}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setDeletingSession(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  
                  {deletingSession.total_bookings > 0 && (
                    <button
                      onClick={() => handleDeleteSession(true)}
                      disabled={deleting}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      {deleting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {t('sessions.deleteConfirm.forceDelete')}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteSession(false)}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    {deleting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {t('sessions.deleteConfirm.delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceSessionsManagement; 