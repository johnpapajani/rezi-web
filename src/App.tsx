import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './hooks/useTranslation';
import { AuthProvider } from './hooks/useAuth';
import LandingPage from './components/pages/LandingPage';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import Dashboard from './components/dashboard/Dashboard';
import BusinessManagement from './components/pages/BusinessManagement';
import BusinessList from './components/pages/BusinessList';
import CreateBusiness from './components/pages/CreateBusiness';
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
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
                    <CreateBusiness />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business/:bizId" 
                element={
                  <ProtectedRoute>
                    <BusinessManagement />
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
