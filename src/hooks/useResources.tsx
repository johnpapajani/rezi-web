import { useState, useEffect } from 'react';
import { resourceApi } from '../utils/api';
import { Resource, ResourceCreate, ResourceUpdate } from '../types';

interface UseResourcesProps {
  bizId: string;
}

export const useResources = ({ bizId }: UseResourcesProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const resourcesData = await resourceApi.getResources(bizId);
      setResources(resourcesData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (resourceData: ResourceCreate) => {
    try {
      setCreating(true);
      setError(null);
      const newResource = await resourceApi.createResource(bizId, resourceData);
      setResources(prev => [...prev, newResource]);
      return newResource;
    } catch (err: any) {
      setError(err.detail || 'Failed to create resource');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const updateResource = async (resourceId: string, resourceUpdate: ResourceUpdate) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedResource = await resourceApi.updateResource(bizId, resourceId, resourceUpdate);
      setResources(prev => prev.map(resource => resource.id === resourceId ? updatedResource : resource));
      return updatedResource;
    } catch (err: any) {
      setError(err.detail || 'Failed to update resource');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      setDeleting(true);
      setError(null);
      await resourceApi.deleteResource(bizId, resourceId);
      setResources(prev => prev.filter(resource => resource.id !== resourceId));
    } catch (err: any) {
      setError(err.detail || 'Failed to delete resource');
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (bizId) {
      fetchResources();
    }
  }, [bizId]);

  return {
    resources,
    loading,
    error,
    creating,
    updating,
    deleting,
    createResource,
    updateResource,
    deleteResource,
    refetch: fetchResources,
  };
};

// Legacy export for backward compatibility
export const useTables = useResources; 