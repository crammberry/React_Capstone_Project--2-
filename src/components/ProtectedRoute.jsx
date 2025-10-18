import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    // Show access denied page instead of redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-lock text-2xl text-red-600"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the admin dashboard. Please contact an administrator if you believe this is an error.
            </p>
            <div className="space-y-3">
              <a
                href="/"
                className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <i className="fas fa-home mr-2"></i>
                Return to Home
              </a>
              <button
                onClick={() => window.history.back()}
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is admin but trying to access non-admin routes (optional additional protection)
  if (!requireAdmin && isAdmin && location.pathname === '/admin') {
    // Allow admin to access admin routes
    return children;
  }

  // Allow access to the protected route
  return children;
};

export default ProtectedRoute;




