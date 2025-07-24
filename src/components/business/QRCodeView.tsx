import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQRCode } from '../../hooks/useQRCode';
import { useBusiness } from '../../hooks/useBusiness';
import { useTranslation } from '../../hooks/useTranslation';
import {
  ArrowLeftIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const QRCodeView: React.FC = () => {
  const { bizId } = useParams<{ bizId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  
  const { business, loading: businessLoading, error: businessError } = useBusiness({ bizId: bizId || '' });
  const { qrCodeData, loading: qrLoading, error: qrError } = useQRCode({ bizId: bizId || '', includeBase64: true });



  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore React app
    }
  };

  const handleDownload = () => {
    if (qrCodeData?.qr_code_base64) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrCodeData.qr_code_base64}`;
      link.download = `${business?.slug || 'business'}-qr-code.png`;
      link.click();
    }
  };

  if (!bizId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.qr.error.businessIdRequired')}</h2>
          <p className="text-gray-600 mb-4">{t('business.qr.error.businessIdRequiredDesc')}</p>
          <button
            onClick={() => navigate('/businesses')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.qr.error.returnToBusinesses')}
          </button>
        </div>
      </div>
    );
  }

  if (businessLoading || qrLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('business.qr.loading')}</p>
        </div>
      </div>
    );
  }

  if (businessError || qrError || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.qr.error.loadFailed')}</h2>
          <p className="text-gray-600 mb-4">{businessError || qrError}</p>
          <button
            onClick={() => navigate(`/business/${bizId}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.qr.error.returnToBusiness')}
          </button>
        </div>
      </div>
    );
  }

  if (!qrCodeData?.qr_code_url && !qrCodeData?.qr_code_base64) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('business.qr.noQrCode.title')}</h2>
          <p className="text-gray-600 mb-4">{t('business.qr.noQrCode.description')}</p>
          <button
            onClick={() => navigate(`/business/${bizId}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('business.qr.error.returnToBusiness')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={() => navigate(`/business/${bizId}`)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('business.qr.title')}</h1>
                <p className="text-sm text-gray-600">{business.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                disabled={!qrCodeData?.qr_code_base64}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>{t('business.qr.download')}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>{t('business.qr.print')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          ref={printRef}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center print:shadow-none print:border-none print:p-12"
        >
          {/* Business Information */}
          <div className="mb-12 print:mb-16">
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-16 w-auto mx-auto mb-6 print:h-20 print:mb-8"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 print:text-5xl print:mb-6 print:text-black">
              {business.name}
            </h1>
            {business.address_line1 && (
              <div className="text-gray-600 space-y-1 text-base print:text-xl print:text-black print:space-y-2 print:mb-8">
                <p className="font-medium">{business.address_line1}</p>
                {business.address_line2 && <p>{business.address_line2}</p>}
                {(business.city || business.postal_code) && (
                  <p>
                    {business.city}
                    {business.city && business.postal_code && ', '}
                    {business.postal_code}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-12 print:mb-16">
            {qrCodeData.qr_code_base64 ? (
              <img
                src={`data:image/png;base64,${qrCodeData.qr_code_base64}`}
                alt={`QR Code for ${business.name}`}
                className="w-64 h-64 border-2 border-gray-300 rounded-lg print:w-80 print:h-80 print:border-black print:rounded-none"
                onError={(e) => {
                  console.error('QR Code base64 image failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : qrCodeData.qr_code_url ? (
              <img
                src={qrCodeData.qr_code_url}
                alt={`QR Code for ${business.name}`}
                className="w-64 h-64 border-2 border-gray-300 rounded-lg print:w-80 print:h-80 print:border-black print:rounded-none"
                onError={(e) => {
                  console.error('QR Code URL image failed to load:', qrCodeData.qr_code_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-64 h-64 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-gray-700 max-w-lg mx-auto print:text-black print:max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 print:text-3xl print:mb-6">
              {t('business.qr.scanInstructions.title')}
            </h2>
            <div className="space-y-3 text-base print:text-xl print:space-y-4">
              <p className="font-medium">
                {t('business.qr.scanInstructions.description')}
              </p>
              <div className="hidden print:block text-lg space-y-2">
                <p className="font-semibold">📱 {t('business.qr.howToScan.title')}</p>
                <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>{t('business.qr.howToScan.step1')}</li>
                  <li>{t('business.qr.howToScan.step2')}</li>
                  <li>{t('business.qr.howToScan.step3')}</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Footer for print */}
          <div className="hidden print:block mt-16 pt-8 border-t-2 border-gray-400 text-base text-black">
            <div className="flex justify-between items-center">
              <p className="font-medium">{business.name}</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            {qrCodeData.qr_code_data && (
              <p className="mt-2 text-sm font-mono break-all">
                {t('business.qr.directLink')}: {qrCodeData.qr_code_data}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QRCodeView; 