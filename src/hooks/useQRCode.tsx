import { useState, useEffect } from 'react';
import { businessApi } from '../utils/api';
import { QRCodeResponse } from '../types';

interface UseQRCodeProps {
  bizId: string;
  includeBase64?: boolean;
}

export const useQRCode = ({ bizId, includeBase64 = false }: UseQRCodeProps) => {
  const [qrCodeData, setQRCodeData] = useState<QRCodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = async () => {
    if (!bizId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const qrData = await businessApi.getQRCodeInfo(bizId, includeBase64);
      setQRCodeData(qrData);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch QR code data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bizId) {
      fetchQRCode();
    }
  }, [bizId, includeBase64]);

  return {
    qrCodeData,
    loading,
    error,
    refetch: fetchQRCode,
  };
}; 