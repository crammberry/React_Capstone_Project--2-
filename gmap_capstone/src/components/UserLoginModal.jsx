import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const UserLoginModal = ({ isOpen, onClose, onLogin, onVerifyEmail }) => {
  const [step, setStep] = useState(1); // 1: Login form, 2: Email verification
  const [formData, setFormData] = useState({ 
    email: '', 
    contactNumber: '' 
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (step === 1) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          setIsLoading(false);
          return;
        }

        // Validate contact number (basic validation)
        if (formData.contactNumber.length < 10) {
          setError('Please enter a valid contact number');
          setIsLoading(false);
          return;
        }

        const success = await onLogin(formData.email, formData.contactNumber);
        if (success) {
          setStep(2);
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        // Email verification step
        const success = await onVerifyEmail(verificationCode);
        if (success) {
          onClose();
        } else {
          setError('Invalid verification code. Please try again.');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'verificationCode') {
      setVerificationCode(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    setError('');
    setVerificationCode('');
  };

  if (!mounted || !isOpen) {
    return null;
  }

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '90%',
        maxWidth: '450px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2 style={{
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          {step === 1 ? 'User Login' : 'Email Verification'}
        </h2>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: step >= 1 ? '#3b82f6' : '#e5e7eb'
            }}></div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: step >= 2 ? '#3b82f6' : '#e5e7eb'
            }}></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              {/* Email Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Gmail Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@gmail.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* Contact Number Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </>
          ) : (
            <>
              {/* Verification Code Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Verification Code *
                </label>
                <input
                  type="text"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    textAlign: 'center',
                    letterSpacing: '0.1em'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <p style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  Check your email for the verification code
                </p>
                <p style={{
                  marginTop: '0.25rem',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  Demo code: 123456
                </p>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? 'Processing...' : (step === 1 ? 'Login & Send Verification' : 'Verify Email')}
          </button>

          {/* Back Button for Step 2 */}
          {step === 2 && (
            <button
              type="button"
              onClick={handleBackToLogin}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#6b7280',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UserLoginModal;



