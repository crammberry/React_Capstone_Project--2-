import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        isAdmin={false}
        onLogout={() => {}}
      />

      {/* 404 Error Section */}
      <section className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <i className="fas fa-search text-4xl text-gray-400"></i>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Sorry, the page you're looking for doesn't exist or has been moved. 
            This might be due to a typo in the URL or the page being removed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2 justify-center min-h-[44px]"
            >
              <i className="fas fa-home"></i>
              Go to Homepage
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2 justify-center min-h-[44px]"
            >
              <i className="fas fa-arrow-left"></i>
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              You might be looking for:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 font-medium text-left p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <i className="fas fa-home mr-2"></i>
                Homepage
              </button>
              <button
                onClick={() => navigate('/map')}
                className="text-blue-600 hover:text-blue-800 font-medium text-left p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <i className="fas fa-map mr-2"></i>
                Cemetery Map
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </div>
      </section>

      <Footer statusText="Page Not Found - Eternal Rest Memorial Park" />
    </div>
  );
};

export default NotFoundPage;
