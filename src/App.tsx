import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './hooks/useTranslation';
import { AuthProvider } from './hooks/useAuth';
import LandingPage from './components/pages/LandingPage';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
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
import BookingCalendar from './components/pages/BookingCalendar';
import ServiceSelection from './components/pages/ServiceSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <BusinessOnboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/:bizId" 
                element={
                  <ProtectedRoute>
                    <ServiceDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service/:serviceId" 
                element={
                  <ProtectedRoute>
                    <ServiceManagementDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service/:serviceId/open-intervals" 
                element={
                  <ProtectedRoute>
                    <ServiceOpenIntervalsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/businesses" 
                element={
                  <ProtectedRoute>
                    <BusinessList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/create" 
                element={
                  <ProtectedRoute>
                    <BusinessOnboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/:bizId/select-service" 
                element={
                  <ProtectedRoute>
                    <ServiceSelection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/:bizId/services" 
                element={
                  <ProtectedRoute>
                    <ServiceManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/:bizId/*" 
                element={
                  <ProtectedRoute>
                    <BusinessDashboard />
                  </ProtectedRoute>
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
