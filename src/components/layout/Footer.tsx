import React from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const footerLinks = {
    company: [
      { key: 'footer.about', href: '#about' },
      { key: 'footer.careers', href: '#careers' },
      { key: 'footer.contact', href: '#contact' },
    ],
    product: [
      { key: 'footer.features', href: '#features' },
      { key: 'footer.pricing', href: '#pricing' },
      { key: 'footer.api', href: '#api' },
    ],
    support: [
      { key: 'footer.help', href: '#help' },
      { key: 'footer.faq', href: '#faq' },
    ],
    legal: [
      { key: 'footer.privacy', href: '#privacy' },
      { key: 'footer.terms', href: '#terms' },
      { key: 'footer.cookies', href: '#cookies' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Instagram', href: '#', icon: '📷' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'Twitter', href: '#', icon: '🐦' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Logo */}
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">R</span>
                  </div>
                  <span className="ml-2 text-2xl font-bold">Rezi</span>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {t('footer.description')}
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">info@rezi.al</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">+355 69 123 4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">Tiranë, Shqipëri</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-3 grid md:grid-cols-4 gap-8">
              {/* Company */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {t(link.key)}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Product */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-4">{t('footer.product')}</h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {t(link.key)}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {t(link.key)}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Legal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-4">{t('footer.legal')}</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {t(link.key)}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 py-8"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Merrni lajmet e fundit
              </h3>
              <p className="text-gray-300">
                Regjistrohuni për të marrë përditësime mbi veçoritë e reja dhe ofertat speciale.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Email adresa juaj"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                Regjistrohu
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Rezi. {t('footer.rights')}
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-xl"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 