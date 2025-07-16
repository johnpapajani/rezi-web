import { useState, useEffect } from 'react';
import { serviceApi } from '../utils/api';
import { Service, ServiceCreate, ServiceUpdate, ServiceWithTables } from '../types';

interface UseServicesProps {
  bizId: string;
  activeOnly?: boolean;
}

export const useServices = ({ bizId, activeOnly = true }: UseServicesProps) => {
  const [services, setServices] = useState<ServiceWithTables[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const servicesData = await serviceApi.getServices(bizId, activeOnly);
      setServices(servicesData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: ServiceCreate) => {
    try {
      setCreating(true);
      setError(null);
      const newService = await serviceApi.createService(bizId, serviceData);
      // Refetch to get the full ServiceWithTables object
      await fetchServices();
      return newService;
    } catch (err: any) {
      setError(err.detail || 'Failed to create service');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const updateService = async (serviceId: string, serviceUpdate: ServiceUpdate) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedService = await serviceApi.updateService(bizId, serviceId, serviceUpdate);
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, ...updatedService }
          : service
      ));
      return updatedService;
    } catch (err: any) {
      setError(err.detail || 'Failed to update service');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      setDeleting(true);
      setError(null);
      await serviceApi.deleteService(bizId, serviceId);
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err: any) {
      setError(err.detail || 'Failed to delete service');
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (bizId) {
      fetchServices();
    }
  }, [bizId, activeOnly]);

  return {
    services,
    loading,
    error,
    creating,
    updating,
    deleting,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
}; 