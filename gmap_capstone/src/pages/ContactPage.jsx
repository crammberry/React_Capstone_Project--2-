import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ContactPage = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        isAdmin={isAdmin}
        onLogout={logout}
      />

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
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 px-4 font-light">
            We're here to help you with any questions or concerns about our memorial park services
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-white text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Visit Us</h2>
                </div>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg">
                    <strong>Eternal Rest Memorial Park</strong><br />
                    San Juan City, Metro Manila<br />
                    Philippines 1500
                  </p>
                  <p className="text-sm text-gray-500">
                    Located in the heart of San Juan City, easily accessible by public transportation and private vehicles.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-phone text-white text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Call Us</h2>
                </div>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-phone text-green-500"></i>
                    <span className="text-lg">+63 (2) 1234-5678</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-mobile-alt text-green-500"></i>
                    <span className="text-lg">+63 917 123 4567</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Available 24/7 for emergencies and urgent matters.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-envelope text-white text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Email Us</h2>
                </div>
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-envelope text-purple-500"></i>
                    <span className="text-lg">info@eternalrestmemorial.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-envelope text-purple-500"></i>
                    <span className="text-lg">support@eternalrestmemorial.com</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    We typically respond within 24 hours.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-clock text-white text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Office Hours</h2>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-semibold">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-semibold">8:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-semibold">By Appointment</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      Digital services available 24/7 through our website
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-paper-plane text-white text-xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Send us a Message</h2>
              </div>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <i className="fas fa-check-circle"></i>
                    <span className="font-semibold">Message sent successfully!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="plot-inquiry">Plot Inquiry</option>
                      <option value="reservation">Plot Reservation</option>
                      <option value="exhumation">Exhumation Request</option>
                      <option value="general">General Information</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                    placeholder="Please describe your inquiry or concern..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-3 min-h-[56px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer statusText="We're here to help you every step of the way" />
    </div>
  );
};

export default ContactPage;



