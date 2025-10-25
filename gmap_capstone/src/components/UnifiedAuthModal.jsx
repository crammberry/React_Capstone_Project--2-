import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import VerificationCodeInput from './VerificationCodeInput';

const UnifiedAuthModal = ({ isOpen, onClose, onLogin, onRegister, onAdminLogin, sendVerificationCode, verifyCode }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'admin'
  const verifyingRef = useRef(false); // Track if verification is in progress
  const [formData, setFormData] = useState({
    // Basic auth fields
    email: '',
    password: '',
    confirmPassword: '',
    // Personal information fields
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    gender: '',
    dateOfBirth: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    city: '',
    zipCode: '',
    contactNumber: '',
    alternatePhone: '',
    occupation: '',
    maritalStatus: ''
  });
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // For multi-step registration
  
  // Email verification code state
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeError, setCodeError] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-send verification code when email is entered in registration
  useEffect(() => {
    if (mode === 'register' && formData.email && !isCodeSent) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(formData.email)) {
        handleSendVerificationCode();
      }
    }
  }, [formData.email, mode, isCodeSent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate form based on mode and step
      if (mode === 'register') {
        if (currentStep === 1) {
          // Basic validation for step 1
          if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
          }
          if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
          }
          if (!isCodeSent) {
            setError('Please wait for the verification code to be sent');
            setIsLoading(false);
            return;
          }
          if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter the complete 6-digit verification code');
            setIsLoading(false);
            return;
          }
          
          if (!isCodeVerified) {
            setError('Please verify your email with the correct code');
            setIsLoading(false);
            return;
          }
          
          // Move to step 2 only if code is verified
          setCurrentStep(2);
          setIsLoading(false);
          return;
        } else if (currentStep === 2) {
          // Personal information validation
          if (!formData.firstName || !formData.lastName) {
            setError('First name and last name are required');
            setIsLoading(false);
            return;
          }
          if (!formData.age || formData.age < 18 || formData.age > 120) {
            setError('Please enter a valid age (18-120)');
            setIsLoading(false);
            return;
          }
          if (!formData.contactNumber || formData.contactNumber.length !== 11) {
            setError('Primary contact must be exactly 11 digits (Philippine format)');
            setIsLoading(false);
            return;
          }
          if (!formData.city || !formData.zipCode) {
            setError('City and zip code are required');
            setIsLoading(false);
            return;
          }
        }
      }

      let result;
      if (mode === 'register' && currentStep === 2) {
        // Pass all personal information to registration
        result = await onRegister(formData.email, formData.password, {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          contactNumber: formData.contactNumber,
          alternatePhone: formData.alternatePhone,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          relationship: formData.relationship,
          occupation: formData.occupation,
          maritalStatus: formData.maritalStatus
        });
      } else {
        result = await onLogin(formData.email, formData.password);
      }

      if (result?.success) {
        if (mode === 'register') {
          setSuccess('Registration successful! Please check your email for verification.');
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          onClose();
        }
      } else {
        setError(result?.error || 'An error occurred');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Auto-construct dateOfBirth when individual date components change
  useEffect(() => {
    if (formData.birthMonth && formData.birthDay && formData.birthYear) {
      const dateOfBirth = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      setFormData(prev => ({
        ...prev,
        dateOfBirth: dateOfBirth
      }));
    }
  }, [formData.birthMonth, formData.birthDay, formData.birthYear]);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      middleName: '',
      lastName: '',
      age: '',
      gender: '',
      dateOfBirth: '',
      birthMonth: '',
      birthDay: '',
      birthYear: '',
      city: '',
      zipCode: '',
      contactNumber: '',
      alternatePhone: '',
      occupation: '',
      maritalStatus: ''
    });
    setError('');
    setSuccess('');
    setCurrentStep(1);
    setVerificationCode('');
    setIsCodeSent(false);
    setIsResendingCode(false);
    setResendCooldown(0);
    setCodeError('');
  };

  const handleSendVerificationCode = async () => {
    try {
      setIsResendingCode(true);
      setCodeError('');
      
      // Call the real email service
      const result = await sendVerificationCode(formData.email);
      if (result.success) {
        setIsCodeSent(true);
        setResendCooldown(30); // 30 second cooldown
        setSuccess('Verification code sent to your email!');
      } else {
        setCodeError(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      setCodeError('Failed to send verification code. Please try again.');
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleResendCode = async () => {
    await handleSendVerificationCode();
  };

  const handleCodeChange = (code) => {
    setVerificationCode(code);
    setCodeError('');
    setIsCodeVerified(false); // Reset verification status when code changes
    
    // Auto-verify when 6 digits are entered
    if (code.length === 6) {
      handleVerifyCode(code);
    }
  };

  const handleVerifyCode = async (code) => {
    // Prevent duplicate verification attempts
    if (verifyingRef.current) {
      console.log('⏸️ Verification already in progress, skipping duplicate call');
      return { success: false, error: 'Verification in progress' };
    }
    
    try {
      verifyingRef.current = true;
      console.log('🔄 Parent component verifying code:', code);
      const result = await verifyCode(formData.email, code);
      console.log('🔄 Parent verification result:', result);
      
      if (result.success) {
        setCodeError(''); // Clear any existing errors
        setSuccess('Email verified successfully!');
        setIsCodeVerified(true); // Mark code as verified
        console.log('✅ Parent component: Code verified successfully');
        return { success: true };
      } else {
        setCodeError(result.error || 'Invalid verification code');
        setIsCodeVerified(false); // Mark code as not verified
        console.log('❌ Parent component: Code verification failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Parent component verification error:', error);
      setCodeError('Verification failed. Please try again.');
      return { success: false, error: 'Verification failed. Please try again.' };
    } finally {
      verifyingRef.current = false;
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        width: '90%',
        maxWidth: mode === 'register' ? '700px' : '450px',
        maxHeight: '90vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with gradient */}
        <div style={{
          background: mode === 'admin' ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' :
                     mode === 'register' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                     'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '2rem 2rem 1rem 2rem',
          color: 'white',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ×
          </button>

          {/* Title */}
          <h2 style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            {mode === 'register' ? '👤 Create Account' : '🔑 User Login'}
          </h2>

          {/* Subtitle */}
          <p style={{
            margin: 0,
            fontSize: '0.95rem',
            opacity: 0.9,
            textAlign: 'center'
          }}>
            {mode === 'register' ? 'Join our community and manage your memorial preferences' : 'Welcome back! Sign in to your account'}
          </p>

          {/* Progress indicator for registration */}
          {mode === 'register' && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1rem',
              gap: '0.5rem'
            }}>
              {[1, 2].map((step) => (
                <div
                  key={step}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= step ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          )}

        </div>

        {/* Mode Selection */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '1rem 2rem 0 2rem',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid transparent',
              background: mode === 'login' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
              color: mode === 'login' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: mode === 'login' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (mode !== 'login') {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'login') {
                e.target.style.background = 'white';
                e.target.style.borderColor = 'transparent';
              }
            }}
          >
            🔑 Login
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid transparent',
              background: mode === 'register' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
              color: mode === 'register' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: mode === 'register' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (mode !== 'register') {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'register') {
                e.target.style.background = 'white';
                e.target.style.borderColor = 'transparent';
              }
            }}
          >
            👤 Register
          </button>
        </div>

        {/* Form Content */}
        <div style={{ 
          padding: '2rem',
          flex: 1,
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {/* Success Message */}
          {success && (
            <div style={{
              backgroundColor: '#d1fae5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Authentication */}
            {mode !== 'register' || (mode === 'register' && currentStep === 1) ? (
              <>
                {/* Email Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    📧 Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = mode === 'admin' ? '#dc2626' : mode === 'register' ? '#10b981' : '#3b82f6';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.background = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Email Verification Code - Only show in registration mode */}
                {mode === 'register' && (
                  <VerificationCodeInput
                    onCodeChange={handleCodeChange}
                    onResend={handleResendCode}
                    isResending={isResendingCode}
                    resendCooldown={resendCooldown}
                    error={codeError}
                    disabled={!isCodeSent}
                    onVerifyCode={handleVerifyCode}
                    isVerified={isCodeVerified}
                  />
                )}

                {/* Password Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    🔒 Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: `2px solid ${formData.password && formData.password.length > 0 && formData.password.length < 6 ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = mode === 'admin' ? '#dc2626' : mode === 'register' ? '#10b981' : '#3b82f6';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = formData.password && formData.password.length > 0 && formData.password.length < 6 ? '#ef4444' : '#e5e7eb';
                      e.target.style.background = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {/* Password Requirements */}
                  {mode === 'register' && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: formData.password.length >= 6 ? '#10b981' : '#6b7280'
                    }}>
                      {formData.password.length >= 6 ? (
                        <span style={{ color: '#10b981' }}>✓ Password meets requirements</span>
                      ) : (
                        <span>• Minimum 6 characters required</span>
                      )}
                    </div>
                  )}
                  {/* Inline Error for Password */}
                  {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
                    <div style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      <span>⚠️</span>
                      <span>Password must be at least 6 characters</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password (Register only) */}
                {mode === 'register' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      🔒 Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: `2px solid ${formData.confirmPassword && formData.confirmPassword !== formData.password ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s',
                        background: '#fafafa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981';
                        e.target.style.background = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = formData.confirmPassword && formData.confirmPassword !== formData.password ? '#ef4444' : '#e5e7eb';
                        e.target.style.background = '#fafafa';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: formData.confirmPassword === formData.password ? '#10b981' : '#ef4444'
                      }}>
                        {formData.confirmPassword === formData.password ? (
                          <span style={{ color: '#10b981' }}>✓ Passwords match</span>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            <span>⚠️</span>
                            <span>Passwords do not match</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Step 2: Personal Information */
              <>
                {/* Personal Details Section */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    👤 Personal Details
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    {/* First Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Middle Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        placeholder="Michael"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* First Row: Date of Birth and Age */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    {/* Date of Birth */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Date of Birth
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* Month Selector */}
                        <select
                          name="birthMonth"
                          value={formData.birthMonth || ''}
                          onChange={handleInputChange}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'all 0.3s',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#10b981';
                            e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Month</option>
                          <option value="01">January</option>
                          <option value="02">February</option>
                          <option value="03">March</option>
                          <option value="04">April</option>
                          <option value="05">May</option>
                          <option value="06">June</option>
                          <option value="07">July</option>
                          <option value="08">August</option>
                          <option value="09">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>

                        {/* Day Selector */}
                        <select
                          name="birthDay"
                          value={formData.birthDay || ''}
                          onChange={handleInputChange}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'all 0.3s',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#10b981';
                            e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => {
                            const day = String(i + 1).padStart(2, '0');
                            return (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            );
                          })}
                        </select>

                        {/* Year Selector */}
                        <select
                          name="birthYear"
                          value={formData.birthYear || ''}
                          onChange={handleInputChange}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'all 0.3s',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#10b981';
                            e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 100 }, (_, i) => {
                            const year = new Date().getFullYear() - 18 - i; // Start from 18 years ago
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Age */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="25"
                        min="18"
                        max="120"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Second Row: Gender and Marital Status */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}>
                    {/* Gender */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Marital Status
                      </label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📞 Contact Information
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    {/* Primary Contact */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Primary Contact *
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => {
                          // Only allow numbers and limit to 11 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                          handleInputChange({ target: { name: 'contactNumber', value } });
                        }}
                        placeholder="09123456789 (11 digits)"
                        required
                        maxLength="11"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `2px solid ${formData.contactNumber && formData.contactNumber.length > 0 && formData.contactNumber.length !== 11 ? '#ef4444' : '#e5e7eb'}`,
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = formData.contactNumber && formData.contactNumber.length > 0 && formData.contactNumber.length !== 11 ? '#ef4444' : '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {/* Phone Number Validation Feedback */}
                      {formData.contactNumber && (
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: '0.75rem'
                        }}>
                          {formData.contactNumber.length === 11 ? (
                            <span style={{ color: '#10b981' }}>✓ Valid mobile number</span>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              <span>⚠️</span>
                              <span>Must be exactly 11 digits ({formData.contactNumber.length}/11)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Alternate Contact */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Alternate Contact
                      </label>
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 987-6543"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}>
                    {/* Occupation */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        placeholder="Software Engineer"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                  </div>
                </div>

                {/* Address Information Section */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🏠 Address Information
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem'
                  }}>
                    {/* City */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Manila"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="1012"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.3s',
                          background: 'white'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#10b981';
                          e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>

              </>
            )}

            {/* Error Message - Now at bottom for better visibility */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #fca5a5',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px rgba(220, 38, 38, 0.1)'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Registration Error</div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Back Button (for registration step 2) */}
              {mode === 'register' && currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleBackStep}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    background: 'white',
                    color: '#6b7280',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'white';
                  }}
                >
                  ← Back
                </button>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || 
                  (mode === 'register' && currentStep === 1 && (
                    formData.password.length < 6 || 
                    formData.password !== formData.confirmPassword ||
                    !isCodeVerified
                  ))
                }
                style={{
                  flex: mode === 'register' && currentStep === 2 ? 2 : 1,
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '0.75rem',
                  background: (isLoading || 
                    (mode === 'register' && currentStep === 1 && (
                      formData.password.length < 6 || 
                      formData.password !== formData.confirmPassword ||
                      !isCodeVerified
                    ))) ? '#9ca3af' : 
                    mode === 'admin' ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 
                    mode === 'register' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (isLoading || 
                    (mode === 'register' && currentStep === 1 && (
                      formData.password.length < 6 || 
                      formData.password !== formData.confirmPassword ||
                      !isCodeVerified
                    ))) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: (isLoading || 
                    (mode === 'register' && currentStep === 1 && (
                      formData.password.length < 6 || 
                      formData.password !== formData.confirmPassword ||
                      !isCodeVerified
                    ))) ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)',
                  opacity: (mode === 'register' && currentStep === 1 && (
                    formData.password.length < 6 || 
                    formData.password !== formData.confirmPassword ||
                    !isCodeVerified
                  )) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !(mode === 'register' && currentStep === 1 && (
                    formData.password.length < 6 || 
                    formData.password !== formData.confirmPassword ||
                    !isCodeVerified
                  ))) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }
                }}
              >
                {isLoading ? '⏳ Processing...' : 
                  mode === 'register' ? (currentStep === 1 ? '➡️ Continue' : '✅ Create Account') : 
                  '🔑 User Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UnifiedAuthModal;
