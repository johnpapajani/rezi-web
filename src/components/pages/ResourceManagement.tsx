import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useResources } from '../../hooks/useResources';
import { useBusiness } from '../../hooks/useBusiness';
import { Resource, ResourceCreate, ResourceUpdate } from '../../types';
import { 
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';

const ResourceManagement: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { business, loading: businessLoading } = useBusiness({ bizId: bizId! });
  const { 
    resources, 
    loading: resourcesLoading, 
    error: resourcesError, 
    creating, 
    updating, 
    deleting,
    createResource, 
    updateResource, 
    deleteResource 
  } = useResources({ bizId: bizId! });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceCreate>({
    code: '',
    seats: 2,
    merge_group: '',
    is_active: true
  });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createResource(formData);
      setIsCreateModalOpen(false);
      setFormData({ code: '', seats: 2, merge_group: '', is_active: true });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    
    try {
      await updateResource(editingResource.id, formData);
      setEditingResource(null);
      setFormData({ code: '', seats: 2, merge_group: '', is_active: true });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteResource = async () => {
    if (!deletingResource) return;
    
    try {
      await deleteResource(deletingResource.id);
      setDeletingResource(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      code: resource.code,
      seats: resource.seats,
      merge_group: resource.merge_group || '',
      is_active: resource.is_active
    });
  };

  if (businessLoading || resourcesLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/business/${bizId}`)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <RectangleGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {t('resources.title')}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {business?.name}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {t('resources.addResource')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {resourcesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error: {resourcesError}</span>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Resources Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {t('resources.title')} ({resources.length})
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('resources.subtitle')}
              </p>
            </div>

            {resources.length === 0 ? (
              <div className="text-center py-12">
                <RectangleGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('resources.noResources')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('resources.noResourcesDescription')}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {t('resources.addResource')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {resources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${resource.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <h3 className="text-lg font-medium text-gray-900">{resource.code}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(resource)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingResource(resource)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('resources.seatsLabel')}</span>
                        <span className="font-medium text-gray-900">{resource.seats}</span>
                      </div>
                      {resource.merge_group && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{t('resources.mergeGroupLabel')}</span>
                          <span className="font-medium text-gray-900">{resource.merge_group}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('resources.status')}:</span>
                        <span className={`font-medium ${resource.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                          {resource.is_active ? t('resources.statusActive') : t('resources.statusInactive')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Create/Edit Resource Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || editingResource) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingResource ? t('resources.editResource') : t('resources.createResource')}
              </h3>
              
              <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('resources.resourceCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData((prev: ResourceCreate) => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('resources.resourceCodePlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('resources.seats')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.seats}
                    onChange={(e) => setFormData((prev: ResourceCreate) => ({ ...prev, seats: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('resources.mergeGroup')}
                  </label>
                  <input
                    type="text"
                    value={formData.merge_group}
                    onChange={(e) => setFormData((prev: ResourceCreate) => ({ ...prev, merge_group: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('resources.mergeGroupPlaceholder')}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('resources.mergeGroupHelp')}
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev: ResourceCreate) => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    {t('resources.active')}
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingResource(null);
                      setFormData({ code: '', seats: 2, merge_group: '', is_active: true });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {t('resources.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating || updating ? t('resources.saving') : (editingResource ? t('resources.update') : t('resources.create'))}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Resource Modal */}
      <AnimatePresence>
        {deletingResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('resources.deleteResource')}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {t('resources.confirmDelete')} <strong>{deletingResource.code}</strong>?
                {t('resources.confirmDeleteDescription')}
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingResource(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('resources.cancel')}
                </button>
                <button
                  onClick={handleDeleteResource}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? t('resources.deleting') : t('resources.delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceManagement; 