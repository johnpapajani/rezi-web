import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';

  const scrollToSection = (href: string) => {
    if (isLandingPage) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on landing page, navigate to landing page first
      navigate('/' + href);
    }
  };

  const footerLinks = {
    company: [
      { key: 'footer.about', href: '#about' },
      { key: 'footer.contact', href: '#contact' },
    ],
    product: [
      { key: 'footer.features', href: '#features' },
      { key: 'footer.pricing', href: '#pricing' },
    ],
    support: [
      { key: 'footer.help', href: '/help' },
      { key: 'footer.faq', href: '#faq' },
    ],
    legal: [
      { key: 'footer.privacy', href: '/privacy' },
      { key: 'footer.terms', href: '/terms' },
      { key: 'footer.cookies', href: '/cookies' },
    ],
  };


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
                    <span className="text-gray-300">hello@restorezi.com</span>
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
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-left"
                      >
                        {t(link.key)}
                      </button>
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
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-left"
                      >
                        {t(link.key)}
                      </button>
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
                      {link.href.startsWith('/') ? (
                        <Link
                          to={link.href}
                          className="text-gray-300 hover:text-white transition-colors duration-200"
                        >
                          {t(link.key)}
                        </Link>
                      ) : (
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-gray-300 hover:text-white transition-colors duration-200 text-left"
                        >
                          {t(link.key)}
                        </button>
                      )}
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
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {t(link.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>



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
              © 2014 Rezi. {t('footer.rights')}
            </div>
          
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 