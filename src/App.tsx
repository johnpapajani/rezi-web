import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './hooks/useTranslation';
import { AuthProvider } from './hooks/useAuth';
import LandingPage from './components/pages/LandingPage';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import EmailVerificationRequired from './components/auth/EmailVerificationRequired';
import Dashboard from './components/dashboard/Dashboard';
import ServiceDashboard from './components/dashboard/ServiceDashboard';
import ServiceManagementDashboard from './components/pages/ServiceManagementDashboard';
import ServiceManagement from './components/pages/ServiceManagement';
import ServiceOpenIntervalsManagement from './components/pages/ServiceOpenIntervalsManagement';
import BusinessOnboarding from './components/onboarding/BusinessOnboarding';
import BusinessManagement from './components/pages/BusinessManagement';
import BusinessDashboard from './components/pages/BusinessDashboard';
import BusinessList from './components/pages/BusinessList';
import BookingList from './components/pages/BookingList';
import ServiceSelection from './components/pages/ServiceSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EmailVerifiedRoute from './components/auth/EmailVerifiedRoute';
import QRCodeView from './components/business/QRCodeView';
import PublicBusinessPage from './components/pages/PublicBusinessPage';
import PublicServiceAvailability from './components/pages/PublicServiceAvailability';
import PublicBookingForm from './components/pages/PublicBookingForm';
import PublicBookingConfirmation from './components/pages/PublicBookingConfirmation';
import PublicBookingSearch from './components/pages/PublicBookingSearch';
import BusinessUserGuide from './components/pages/BusinessUserGuide';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsOfService from './components/pages/TermsOfService';
import CookiePolicy from './components/pages/CookiePolicy';
import HelpPage from './components/pages/HelpPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route 
                path="/verify-email-required" 
                element={
                  <ProtectedRoute>
                    <EmailVerificationRequired />
                  </ProtectedRoute>
                } 
              />
              <Route path="/guide" element={<BusinessUserGuide />} />
              
              {/* Legal Pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/help" element={<HelpPage />} />
              
              {/* Public Booking Routes */}
              <Route path="/book/:slug" element={<PublicBusinessPage />} />
              <Route path="/book/:slug/service/:serviceId" element={<PublicServiceAvailability />} />
              <Route path="/book/:slug/service/:serviceId/booking" element={<PublicBookingForm />} />
              <Route path="/book/confirmation/:bookingId" element={<PublicBookingConfirmation />} />
              <Route path="/booking-search" element={<PublicBookingSearch />} />
              <Route 
                path="/onboarding" 
                element={
                  <EmailVerifiedRoute>
                    <BusinessOnboarding />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <EmailVerifiedRoute>
                    <Dashboard />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/business/:bizId" 
                element={
                  <EmailVerifiedRoute>
                    <ServiceDashboard />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/service/:serviceId" 
                element={
                  <EmailVerifiedRoute>
                    <ServiceManagementDashboard />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/service/:serviceId/open-intervals" 
                element={
                  <EmailVerifiedRoute>
                    <ServiceOpenIntervalsManagement />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/businesses" 
                element={
                  <EmailVerifiedRoute>
                    <BusinessList />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/business/create" 
                element={
                  <EmailVerifiedRoute>
                    <BusinessOnboarding />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/business/:bizId/qr" 
                element={
                  <EmailVerifiedRoute>
                    <QRCodeView />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/business/:bizId/select-service" 
                element={
                  <EmailVerifiedRoute>
                    <ServiceSelection />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/business/:bizId/services" 
                element={
                  <EmailVerifiedRoute>
                    <ServiceManagement />
                  </EmailVerifiedRoute>
                } 
              />
              <Route 
                path="/business/:bizId/*" 
                element={
                  <EmailVerifiedRoute>
                    <BusinessDashboard />
                  </EmailVerifiedRoute>
                } 
              />
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
