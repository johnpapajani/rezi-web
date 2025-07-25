import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  const navItems = [
    { key: 'nav.features', href: '#features' },
    { key: 'nav.pricing', href: '#pricing' },
    { key: 'nav.about', href: '#about' },
    { key: 'nav.contact', href: '#contact' },
  ];

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
    setIsMenuOpen(false);
  };

  const handleAuthAction = async (action: 'login' | 'signup' | 'logout') => {
    if (action === 'logout') {
      await signOut();
      navigate('/');
    } else if (action === 'login') {
      navigate('/signin');
    } else if (action === 'signup') {
      navigate('/signup');
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rezi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Only show on landing page */}
          {isLandingPage && (
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  {t(item.key)}
                </button>
              ))}
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Find Booking Link */}
            <Link 
              to="/booking-search" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              {t('nav.findBooking')}
            </Link>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <GlobeAltIcon className="w-5 h-5" />
                <span className="text-sm">
                  {languages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setLanguage(language.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <button 
                  onClick={() => handleAuthAction('logout')}
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  {t('dashboard.signOut')}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleAuthAction('login')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => handleAuthAction('signup')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('nav.signup')}
                </button>
              </>
            )}
          </div>

          {/* Mobile Actions - Language Switcher and Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Mobile Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors p-1"
              >
                <GlobeAltIcon className="w-5 h-5" />
                <span className="text-sm">
                  {languages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
              </button>

              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setLanguage(language.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span>{language.flag}</span>
                        <span className="text-xs">{language.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Navigation items - only show on landing page */}
              {isLandingPage && navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium py-2"
                >
                  {t(item.key)}
                </button>
              ))}
              
              {/* Find Booking Link - show on all pages */}
              <Link 
                to="/booking-search" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                {t('nav.findBooking')}
              </Link>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium py-2"
                      >
                        {t('nav.dashboard')}
                      </Link>
                      <button 
                        onClick={() => handleAuthAction('logout')}
                        className="block w-full text-left text-gray-700 hover:text-red-600 font-medium py-2"
                      >
                        {t('dashboard.signOut')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleAuthAction('login')}
                        className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium py-2"
                      >
                        {t('nav.login')}
                      </button>
                      <button 
                        onClick={() => handleAuthAction('signup')}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        {t('nav.signup')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 