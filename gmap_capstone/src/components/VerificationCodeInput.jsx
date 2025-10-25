import React, { useState, useEffect, useRef } from 'react';

const VerificationCodeInput = ({ 
  onCodeChange, 
  onResend, 
  isResending, 
  resendCooldown, 
  error,
  disabled = false,
  onVerifyCode = null, // New prop for real-time verification
  isVerified = false // Prop from parent indicating if code is verified
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'valid', 'invalid', null
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!disabled) {
      // Focus first input when component becomes active
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [disabled]);

  // Sync with parent's verification state
  useEffect(() => {
    if (isVerified) {
      setVerificationStatus('valid');
      console.log('✅ Child component synced with parent: Code verified');
    }
  }, [isVerified]);

  const handleCodeChange = async (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Call parent with the full code
    const fullCode = newCode.join('');
    onCodeChange(fullCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Real-time verification when 6 digits are entered
    if (fullCode.length === 6 && onVerifyCode) {
      setIsVerifying(true);
      setVerificationStatus(null);
      
      try {
        console.log('🔄 Starting verification for code:', fullCode);
        const result = await onVerifyCode(fullCode);
        console.log('🔄 Verification result:', result);
        
        // Only set status if verification completed (ignore "in progress" responses)
        if (result.success) {
          setVerificationStatus('valid');
          console.log('✅ UI updated to valid status');
        } else if (result.error !== 'Verification in progress') {
          // Don't show error for duplicate calls being skipped
          setVerificationStatus('invalid');
          console.log('❌ UI updated to invalid status');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        setVerificationStatus('invalid');
      } finally {
        setIsVerifying(false);
      }
    } else if (fullCode.length < 6) {
      // Reset status when code is incomplete
      setVerificationStatus(null);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePaste(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    
    setCode(newCode);
    onCodeChange(pastedData);
    
    // Focus the last filled input or the last input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBorderColor = () => {
    if (error) return '2px solid #ef4444';
    if (verificationStatus === 'valid') return '2px solid #10b981';
    if (verificationStatus === 'invalid') return '2px solid #ef4444';
    return '2px solid #e5e7eb';
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Code Input Fields */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength="1"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: '600',
              border: getBorderColor(),
              borderRadius: '0.5rem',
              backgroundColor: disabled ? '#f9fafb' : 'white',
              color: '#374151',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>

      {/* Verification Status */}
      {isVerifying && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          <div style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid #6b7280',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Verifying code...
        </div>
      )}

      {verificationStatus === 'valid' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
          color: '#10b981',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <span>✅</span>
          Code verified successfully!
        </div>
      )}

      {verificationStatus === 'invalid' && !isVerified && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
          color: '#ef4444',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <span>❌</span>
          Invalid verification code
        </div>
      )}

      {/* Error Message - Only show if not verified */}
      {error && !isVerified && (
        <div style={{
          color: '#ef4444',
          fontSize: '0.875rem',
          textAlign: 'center',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Resend Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={onResend}
          disabled={isResending || resendCooldown > 0 || disabled}
          style={{
            background: 'none',
            border: 'none',
            color: (isResending || resendCooldown > 0 || disabled) ? '#9ca3af' : '#10b981',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: (isResending || resendCooldown > 0 || disabled) ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            opacity: (isResending || resendCooldown > 0 || disabled) ? 0.6 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          {isResending ? (
            <>
              <span>⏳</span>
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            <>
              <span>⏰</span>
              Resend in {formatTime(resendCooldown)}
            </>
          ) : (
            <>
              <span>📧</span>
              Resend Code
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '0.5rem',
        border: '1px solid #bae6fd'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: '#1e40af',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          <strong>Check your email</strong> for the 6-digit verification code. 
          The code will expire in 10 minutes.
        </p>
      </div>
    </div>
  );
};

export default VerificationCodeInput;
