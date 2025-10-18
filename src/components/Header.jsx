import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SimpleAdminLoginModal from './SimpleAdminLoginModal';

const Header = () => {
  const { isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleAdminLogin = async (credentials) => {
    try {
      const success = await login(credentials.username, credentials.password);
      if (success) {
        setShowAdminLogin(false);
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close modal when user becomes admin
  useEffect(() => {
    if (isAdmin) {
      setShowAdminLogin(false);
    }
  }, [isAdmin]);

  return (
    <>
      <header className="bg-[#2C3E50] text-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo */}
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex items-center min-w-0">
                <div className="text-white text-lg sm:text-xl mr-1 sm:mr-2 flex-shrink-0">✚</div>
                <div className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold truncate">
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

            {/* Admin Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {isAdmin ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="text-xs sm:text-sm text-white hidden sm:inline">Admin Mode</span>
                  <button
                    onClick={() => navigate('/admin')}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/admin' 
                        ? 'bg-[#2980B9] text-white border-2 border-blue-300' 
                        : 'bg-[#3498DB] hover:bg-[#2980B9] text-white'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-[#3498DB] hover:bg-[#2980B9] text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center gap-1 sm:gap-2"
                >
                  <span className="text-white text-sm sm:text-base">👤</span>
                  <span className="hidden sm:inline">Admin Login</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <SimpleAdminLoginModal
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLogin={handleAdminLogin}
        />
      )}
    </>
  );
};

export default Header;