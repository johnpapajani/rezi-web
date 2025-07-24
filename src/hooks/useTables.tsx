import { useState, useEffect } from 'react';
import { tableApi } from '../utils/api';
import { Table, TableCreate, TableUpdate } from '../types';
import { serviceApi } from '../utils/api';

interface UseTablesProps {
  bizId: string;
}

export const useTables = ({ bizId }: UseTablesProps) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const tablesData = await tableApi.getTables(bizId);
      setTables(tablesData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (tableData: TableCreate) => {
    try {
      setCreating(true);
      setError(null);
      
      // Validate that service_id is provided
      if (!tableData.service_id) {
        throw new Error('Service ID is required to create a table');
      }
      
      // Use the service router endpoint instead of business router
      const newTable = await serviceApi.addServiceTable(tableData.service_id, tableData);
      setTables(prev => [...prev, newTable]);
      return newTable;
    } catch (err: any) {
      setError(err.detail || 'Failed to create table');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const updateTable = async (tableId: string, tableUpdate: TableUpdate) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedTable = await tableApi.updateTable(bizId, tableId, tableUpdate);
      setTables(prev => prev.map(table => table.id === tableId ? updatedTable : table));
      return updatedTable;
    } catch (err: any) {
      setError(err.detail || 'Failed to update table');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const deleteTable = async (tableId: string) => {
    try {
      setDeleting(true);
      setError(null);
      await tableApi.deleteTable(bizId, tableId);
      setTables(prev => prev.filter(table => table.id !== tableId));
    } catch (err: any) {
      setError(err.detail || 'Failed to delete table');
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (bizId) {
      fetchTables();
    }
  }, [bizId]);

  return {
    tables,
    loading,
    error,
    creating,
    updating,
    deleting,
    createTable,
    updateTable,
    deleteTable,
    refetch: fetchTables,
  };
}; 