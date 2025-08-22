import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import BroadcastRequests from './pages/BroadcastRequests';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupForm />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="services" element={<Services />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="broadcast" element={<BroadcastRequests />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;