import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const Contact: React.FC = () => {
  const { t } = useTranslation();

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: t('contact.info.email.title'),
      value: 'hello@restorezi.com',
      description: t('contact.info.email.description'),
    },
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('contact.info.title')}
          </h3>
          
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => window.open(`mailto:${info.value}`, '_blank')}
              >
                <div className="flex items-start space-x-4 p-8 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-300 group-hover:shadow-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors duration-300">
                    <info.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {info.title}
                    </h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-200">
                        {info.value}
                      </span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <p className="text-gray-600">
                      {info.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact; 