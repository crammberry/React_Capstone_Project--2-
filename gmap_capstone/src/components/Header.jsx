import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UnifiedAuthModal from './UnifiedAuthModal';

const Header = () => {
  const { user, userProfile, isAdmin, isUser, loading, signIn, signUp, adminLogin, signOut, sendVerificationCode, verifyCode } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);



  const handleLogin = async (email, password) => {
    try {
      const result = await signIn(email, password);
      if (result.success) {
        setShowAuthModal(false);
        // Navigate based on user role
        if (isAdmin) {
          navigate('/admin');
        }
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (email, password, personalInfo) => {
    try {
      const result = await signUp(email, password, personalInfo);
      if (result.success) {
        setShowAuthModal(false);
        // Registration successful - user can now login
      }
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleAdminLogin = async (email, password) => {
    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        setShowAuthModal(false);
        navigate('/admin');
      }
      return result;
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    console.log('🔄 Header: Starting logout process...');
    await signOut();
    console.log('✅ Header: Logout completed, navigating to home');
    navigate('/');
  };

  // Close modal when user logs in
  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
    }
  }, [user]);

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('🎯 Header: Auth state changed -', {
      user: user?.email || 'null',
      userProfile: userProfile?.email || 'null',
      userRole: userProfile?.role || 'unknown',
      isAdmin,
      isUser,
      loading
    });
  }, [user, userProfile, isAdmin, isUser, loading]);

  return (
    <>
      <header className="bg-[#2C3E50] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="text-white text-xl mr-2">✚</div>
                <div className="text-white text-xl font-semibold">
                  Eternal Rest Memorial Park
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => navigate('/')}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/' 
                    ? 'text-blue-300 border-b-2 border-blue-300' 
                    : 'text-white hover:text-gray-300'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/about')}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/about' 
                    ? 'text-blue-300 border-b-2 border-blue-300' 
                    : 'text-white hover:text-gray-300'
                }`}
              >
                About
              </button>
              <button
                onClick={() => navigate('/contact')}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/contact' 
                    ? 'text-blue-300 border-b-2 border-blue-300' 
                    : 'text-white hover:text-gray-300'
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Authentication Controls */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="text-sm text-white">Loading...</div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  {isAdmin ? (
                    <>
                      <span className="text-sm text-white">Admin Mode</span>
                      <button
                        onClick={() => navigate('/admin')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          location.pathname === '/admin' 
                            ? 'bg-[#2980B9] text-white border-2 border-blue-300' 
                            : 'bg-[#3498DB] hover:bg-[#2980B9] text-white'
                        }`}
                      >
                        Dashboard
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white">
                        {userProfile?.email || user.email}
                      </span>
                      {userProfile?.is_verified ? (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="text-white">🔐</span>
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Unified Authentication Modal */}
      <UnifiedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onAdminLogin={handleAdminLogin}
        sendVerificationCode={sendVerificationCode}
        verifyCode={verifyCode}
      />


    </>
  );
};

export default Header;