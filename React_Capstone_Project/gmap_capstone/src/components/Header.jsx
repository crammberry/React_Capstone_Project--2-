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

            {/* Admin Controls */}
            <div className="flex items-center space-x-4">
              {isAdmin ? (
                <div className="flex items-center space-x-4">
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
                  <button
                    onClick={handleLogout}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-[#3498DB] hover:bg-[#2980B9] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="text-white">👤</span>
                  Admin Login
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