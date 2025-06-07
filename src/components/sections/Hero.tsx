import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon,
  ChartBarSquareIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      number: '500+',
      label: t('hero.stats.businesses'),
      icon: UserGroupIcon,
    },
    {
      number: '10K+',
      label: t('hero.stats.reservations'),
      icon: ChartBarSquareIcon,
    },
    {
      number: '98%',
      label: t('hero.stats.satisfaction'),
      icon: StarIcon,
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              {t('hero.title').split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={index === 0 || index === 1 ? 'text-gradient' : ''}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-xl text-gray-600 leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                {t('hero.cta.primary')}
              </button>
              <button className="flex items-center justify-center bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transform hover:scale-105 transition-all duration-200 shadow-lg">
                <PlayIcon className="w-5 h-5 mr-2" />
                {t('hero.cta.secondary')}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative lg:pl-8"
          >
            <div className="relative">
              {/* Main Device Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative z-20 mx-auto w-80 h-96 bg-white rounded-3xl shadow-2xl border-8 border-gray-200 overflow-hidden"
              >
                <div className="bg-blue-600 h-24 flex items-center justify-center">
                  <div className="text-white font-bold text-xl">Rezi Dashboard</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-100 h-4 rounded-full animate-pulse" />
                  <div className="bg-gray-100 h-4 w-3/4 rounded-full animate-pulse" />
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold">Rezervime Sot</div>
                      <div className="text-2xl font-bold text-blue-600">24</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <div className="flex-1 bg-gray-200 h-3 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">+15%</div>
                  <div className="text-xs text-gray-600">Këtë javë</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero; 