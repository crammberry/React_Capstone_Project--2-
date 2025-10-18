import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 py-16 sm:py-20 text-center border-b border-gray-200/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
          <h1 className="text-4xl sm:text-5xl text-slate-800 mb-6 font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            About Eternal Rest Memorial Park
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 px-4 font-light">
            A comprehensive digital cemetery management system designed to honor and preserve the memory of your loved ones
          </p>
          
          <button
            onClick={handleBackToHome}
            className="group relative bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl flex items-center gap-3 justify-center min-h-[56px] mx-auto"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50/20 to-cyan-50/20 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          
          {/* Mission Statement */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 mb-12 border border-white/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <i className="fas fa-heart text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl sm:text-4xl text-slate-800 font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                Our Mission
              </h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Eternal Rest Memorial Park is dedicated to providing a dignified and peaceful resting place for your loved ones. 
              Our digital cemetery management system ensures that every family can easily locate, manage, and honor their 
              departed family members with the utmost respect and care.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe that technology should serve to preserve memories and make cemetery management more accessible, 
              transparent, and user-friendly for families during their time of need.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Interactive Map */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-map-marked-alt text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Interactive Cemetery Map</h3>
              <p className="text-gray-600 leading-relaxed">
                Navigate through our cemetery with our detailed interactive map. Find specific plots, 
                sections, and areas with ease using our user-friendly interface.
              </p>
            </div>

            {/* Plot Management */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-search text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Plot Search & Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Search for your loved ones by name, plot number, or section. Our comprehensive 
                database makes it easy to locate and manage burial plots.
              </p>
            </div>

            {/* Reservation System */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-calendar-check text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Plot Reservation</h3>
              <p className="text-gray-600 leading-relaxed">
                Reserve plots for future use with our streamlined reservation system. 
                Secure your family's resting place with just a few clicks.
              </p>
            </div>

            {/* Admin Dashboard */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-cogs text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Administrative Tools</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive admin dashboard for cemetery management. Track plot status, 
                manage reservations, and maintain accurate records.
              </p>
            </div>

            {/* Exhumation Requests */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-file-alt text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Exhumation Services</h3>
              <p className="text-gray-600 leading-relaxed">
                Submit and manage exhumation requests through our secure system. 
                We handle all necessary documentation and procedures with care.
              </p>
            </div>

            {/* 24/7 Access */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">24/7 Digital Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Access cemetery information anytime, anywhere. Our digital platform 
                provides round-the-clock access to plot information and services.
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 mb-12 border border-white/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <i className="fas fa-code text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl sm:text-4xl text-slate-800 font-bold bg-gradient-to-r from-slate-800 to-green-600 bg-clip-text text-transparent">
                Technology & Innovation
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Modern Web Technologies</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-green-500"></i>
                    React.js for responsive user interface
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-green-500"></i>
                    Tailwind CSS for modern styling
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-green-500"></i>
                    SVG-based interactive maps
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-green-500"></i>
                    Real-time data management
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Security & Reliability</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <i className="fas fa-shield-alt text-blue-500"></i>
                    Secure data encryption
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-shield-alt text-blue-500"></i>
                    Role-based access control
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-shield-alt text-blue-500"></i>
                    Regular data backups
                  </li>
                  <li className="flex items-center gap-3">
                    <i className="fas fa-shield-alt text-blue-500"></i>
                    Privacy protection compliance
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <i className="fas fa-phone text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl sm:text-4xl text-slate-800 font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                Contact Us
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Get in Touch</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-map-marker-alt text-blue-500"></i>
                    <span>San Juan City, Metro Manila, Philippines</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-phone text-blue-500"></i>
                    <span>+63 (2) 1234-5678</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-envelope text-blue-500"></i>
                    <span>info@eternalrestmemorial.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-clock text-blue-500"></i>
                    <span>Open 24/7 for digital services</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Office Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>8:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>By Appointment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer statusText="Honoring memories, preserving legacies" />
    </div>
  );
};

export default AboutPage;



