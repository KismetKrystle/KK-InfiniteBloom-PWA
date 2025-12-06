import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Main application components
import LandingPage from './components/LandingPage';
import AccessPage from './components/AccessPage';
import ProfilePage from './components/ProfilePage';
import FlipbookPage from './components/FlipbookPage';
// Admin components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductDetailPage from './components/admin/ProductDetailPage';
import { AdminProvider, useAdmin } from './contexts/AdminContext';

// Protected Admin Route Component
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdmin();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return isAdmin ? <>{children}</> : <AdminLogin />;
}

interface User {
  email: string;
  name?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [hasAccessCode, setHasAccessCode] = useState(false);

  return (
    <AdminProvider>
      <Router>
        <div className="scroll-container bg-background">
          <Routes>
            {/* Admin Routes - Now the default view */}
            <Route 
              path="/" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/product/:productId" 
              element={
                <ProtectedAdminRoute>
                  <ProductDetailPage />
                </ProtectedAdminRoute>
              } 
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Public Routes - Now accessible via specific paths */}
            <Route path="/landing" element={<LandingPage />} />
            <Route 
              path="/access" 
              element={
                <AccessPage 
                  user={user} 
                  setUser={setUser}
                  hasAccessCode={hasAccessCode}
                  setHasAccessCode={setHasAccessCode}
                />
              } 
            />
            <Route 
              path="/profile" 
              element={
                hasAccessCode || user ? (
                  <ProfilePage setUser={setUser} />
                ) : (
                  <Navigate to="/access" replace />
                )
              }
            />
            <Route 
              path="/flipbook" 
              element={
                user ? (
                  <FlipbookPage user={user} />
                ) : (
                  <Navigate to="/access" replace />
                )
              }
            />
            
            {/* Catch-all route - redirects any unmatched paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AdminProvider>
  );
}