import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Email verification failed. Please try again.');
          setLoading(false);
          return;
        }

        if (data.session) {
          // User is now verified and logged in
          console.log('Email verification successful!');
          // Redirect to home page
          navigate('/');
        } else {
          // No session, redirect to login
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('An error occurred during email verification.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{
          marginTop: '1rem',
          fontSize: '1.125rem',
          color: '#374151',
          fontWeight: '500'
        }}>
          Verifying your email...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            ❌
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '0.5rem'
          }}>
            Verification Failed
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '1.5rem'
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;



