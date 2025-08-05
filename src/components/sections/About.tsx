import React from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const About: React.FC = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: ShieldCheckIcon,
      title: t('about.values.trust.title'),
      description: t('about.values.trust.description'),
    },
    {
      icon: SparklesIcon,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description'),
    },
    {
      icon: HeartIcon,
      title: t('about.values.customer.title'),
      description: t('about.values.customer.description'),
    },
  ];

  const stats = [
    {
      number: '2014',
      label: t('about.stats.founded'),
    },
    {
      number: '100+',
      label: t('about.stats.businesses'),
    },
    {
      number: '10,000+',
      label: t('about.stats.bookings'),
    },
    {
      number: '99%',
      label: t('about.stats.uptime'),
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
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
            {t('about.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column - Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.story.title')}
            </h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>{t('about.story.paragraph1')}</p>
              <p>{t('about.story.paragraph2')}</p>
              <p>{t('about.story.paragraph3')}</p>
            </div>
          </motion.div>

          {/* Right Column - Mission */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center mb-6">
              <BuildingStorefrontIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">{t('about.mission.title')}</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              {t('about.mission.description')}
            </p>
            
            <div className="flex items-center mb-4">
              <UserGroupIcon className="w-6 h-6 text-purple-600 mr-3" />
              <h4 className="text-lg font-semibold text-gray-900">{t('about.vision.title')}</h4>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t('about.vision.description')}
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('about.values.title')}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t('about.achievements.title')}
            </h3>
            <p className="text-blue-100 text-lg">
              {t('about.achievements.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About; 