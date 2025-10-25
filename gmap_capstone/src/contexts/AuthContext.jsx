import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase/config';
import { EmailService } from '../services/EmailService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // NEW: Track superadmin status
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const isLoadingProfileRef = useRef(false); // Use ref instead of state for synchronous access
  const hasLoggedOut = useRef(false); // Track if user explicitly logged out

  const loadUserProfile = async (user) => {
    // Prevent multiple simultaneous profile loads
    if (isLoadingProfileRef.current) {
      console.log('⏸️ Profile already loading, skipping duplicate request');
      return;
    }
    
    isLoadingProfileRef.current = true;
    try {
      console.log('📋 Loading profile for user:', user.email);
      console.log('📋 User ID:', user.id);
      
      // Query profile with timeout to prevent infinite hanging
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      // Create timeout promise (5 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout after 5 seconds')), 5000)
      );
      
      // Race between query and timeout
      let profile, error;
      try {
        const result = await Promise.race([profileQuery, timeoutPromise]);
        profile = result.data;
        error = result.error;
        console.log('📋 Profile query result:', { profile, error });
      } catch (timeoutError) {
        console.error('⏱️ Profile query timed out:', timeoutError.message);
        error = timeoutError;
      }

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No profile found in database (PGRST116)');
        } else {
          console.error('❌ Error loading profile:', error);
        }
        
        // CRITICAL FIX: If we already have a profile for this user, DON'T replace it with fallback!
        // This prevents losing superadmin/admin roles on timeout
        if (userProfile && userProfile.id === user.id) {
          console.log('✅ Using existing cached profile, NOT replacing with fallback');
          return;
        }
        
        // Only create fallback profile if we don't have one
        console.log('📋 Setting basic profile from user object (no existing profile)');
        setUserProfile({
          id: user.id,
          email: user.email,
          role: 'user',
          is_verified: true
        });
        setIsUser(true);
        console.log('✅ Basic profile set successfully');
        return;
      }

      if (profile) {
        console.log('✅ Profile loaded successfully from database:', profile);
        setUserProfile(profile);
        // Set role flags
        setIsSuperAdmin(profile.role === 'superadmin');
        setIsAdmin(profile.role === 'admin' || profile.role === 'superadmin'); // superadmin is also admin
        setIsUser(profile.role === 'user');
        console.log('✅ Profile state updated:', {
          role: profile.role,
          isSuperAdmin: profile.role === 'superadmin',
          isAdmin: profile.role === 'admin' || profile.role === 'superadmin',
          isUser: profile.role === 'user'
        });
      } else {
        console.log('ℹ️ No profile data returned, creating basic profile');
        // If no profile exists, just set basic user info without creating profile
        setUserProfile({
          id: user.id,
          email: user.email,
          role: 'user',
          is_verified: true // Assume verified if they can log in
        });
        setIsUser(true);
        console.log('✅ Basic profile set successfully');
      }
    } catch (error) {
      console.error('❌ Exception in loadUserProfile:', error);
      
      // CRITICAL FIX: If we already have a profile for this user, DON'T replace it with fallback!
      // This prevents losing superadmin/admin roles on error
      if (userProfile && userProfile.id === user.id) {
        console.log('✅ Using existing cached profile, NOT replacing with fallback (exception)');
        return;
      }
      
      // Only create fallback profile if we don't have one
      console.log('📋 Setting fallback profile due to exception (no existing profile)');
      setUserProfile({
        id: user.id,
        email: user.email,
        role: 'user',
        is_verified: true
      });
      setIsUser(true);
      console.log('✅ Fallback profile set due to exception');
    } finally {
      isLoadingProfileRef.current = false; // Always reset loading state
    }
  };

  useEffect(() => {
    console.log('🔍 AuthContext initialized - Checking for existing session');
    
    // Check for existing session on mount
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          setUser(session.user);
          await loadUserProfile(session.user);
          setLoading(false);
        } else {
          console.log('ℹ️ No existing session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change EVENT:', event);
        console.log('🔄 Auth state change SESSION:', session?.user?.email || 'No session');
        
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // Explicit sign out or user deleted
          console.log('🚪 User explicitly signed out');
          setUser(null);
          setUserProfile(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
          setIsUser(false);
          setLoading(false);
          isLoadingProfileRef.current = false; // Reset profile loading state
        } else if (session?.user) {
          // Check if user explicitly logged out - prevent auto-login
          if (hasLoggedOut.current) {
            console.log('🚫 User explicitly logged out, ignoring session restoration');
            setUser(null);
            setUserProfile(null);
            setIsSuperAdmin(false);
            setIsAdmin(false);
            setIsUser(false);
            setLoading(false);
            return;
          }
          
          // Only load profile for SIGNED_IN and INITIAL_SESSION events
          // Ignore TOKEN_REFRESHED and other redundant events
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            // User signed in or session restored
            console.log('👤 User session active, setting user and loading profile');
            
            // CRITICAL FIX: Only load profile if we don't already have it for this user
            const needsProfileLoad = !userProfile || userProfile.id !== session.user.id;
            
            if (needsProfileLoad) {
              console.log('📋 Profile not loaded yet, loading now...');
              setUser(session.user);
              
              try {
                await loadUserProfile(session.user);
                console.log('📋 loadUserProfile completed');
              } catch (error) {
                console.error('❌ Error calling loadUserProfile:', error);
              }
            } else {
              console.log('✅ Profile already loaded for this user, skipping reload');
              setUser(session.user); // Just update user session data
            }
            
            setLoading(false);
            console.log('✅ Auth state change handler completed');
          } else {
            // TOKEN_REFRESHED or other event - just update user, don't reload profile
            console.log('🔄 Token refresh or minor event, skipping profile reload');
            setUser(session.user);
            setLoading(false);
          }
        } else {
          // No session
          console.log('❌ No active session');
          setUser(null);
          setUserProfile(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
          setIsUser(false);
          setLoading(false);
          isLoadingProfileRef.current = false; // Reset profile loading state
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, personalInfo) => {
    try {
      setLoading(true);
      
      // Check if email already exists in profiles table
      try {
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('email, is_verified')
          .eq('email', email)
          .maybeSingle();

        // If error is "not found" (PGRST116), that's fine - email is available
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing email:', checkError);
          // Don't block registration if we can't check - let Supabase handle it
          console.warn('Could not verify email availability, proceeding with registration...');
        } else if (existingProfile) {
          if (existingProfile.is_verified) {
            return { success: false, error: 'This email address is already registered and verified. Please use a different email or try logging in.' };
    } else {
            return { success: false, error: 'This email address is already registered but not yet verified. Please check your email for the verification link or use a different email address.' };
          }
        }
      } catch (error) {
        console.warn('Email availability check failed, proceeding with registration:', error);
        // Continue with registration - Supabase will handle duplicate emails
      }

      console.log('📝 Creating Supabase user for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            contact_number: personalInfo.contactNumber
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        // Handle specific Supabase auth errors
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return { success: false, error: 'This email address is already registered. Please use a different email or try logging in.' };
        }
        throw error;
      }

      console.log('✅ Supabase user created:', data.user?.id);
      // Note: Email confirmation is handled by database trigger (auto-confirm-all-users.sql)

      // Create user profile with personal information
      if (data.user) {
        console.log('📝 Creating user profile for:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: email,
            role: 'user',
            contact_number: personalInfo.contactNumber,
            alternate_phone: personalInfo.alternatePhone,
            first_name: personalInfo.firstName,
            middle_name: personalInfo.middleName,
            last_name: personalInfo.lastName,
            age: personalInfo.age,
            gender: personalInfo.gender,
            date_of_birth: personalInfo.dateOfBirth,
            marital_status: personalInfo.maritalStatus,
            occupation: personalInfo.occupation,
                   city: personalInfo.city,
                   zip_code: personalInfo.zipCode,
            is_verified: true
          }]);

        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
    } else {
          console.log('✅ User profile created successfully');
        }
      }

      return { success: true, data, needsVerification: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting to sign in user:', email);
      
      // Reset logout flag - user is explicitly logging in
      hasLoggedOut.current = false;
      
      // Try to sign in with Supabase Auth directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        // Handle specific Supabase auth errors
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials.' };
        }
        if (error.message.includes('email not confirmed')) {
          return { success: false, error: 'Email not confirmed. Please check your email for the verification link.' };
        }
        if (error.message.includes('User not found')) {
          return { success: false, error: 'User not found. Please register first.' };
        }
        return { success: false, error: error.message };
      }

      console.log('✅ User signed in successfully:', data.user?.email);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting admin login for:', email);
      
      // Reset logout flag - user is explicitly logging in
      hasLoggedOut.current = false;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Admin login auth error:', error);
        // Handle specific Supabase auth errors
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials.' };
        }
        if (error.message.includes('email not confirmed')) {
          return { success: false, error: 'Email not confirmed. Please check your email for the verification link.' };
        }
        throw error;
      }

      console.log('✅ Auth successful, checking admin role for user:', data.user.id);

      // Check if user is admin (after successful login)
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log('📋 Profile query result:', { profile, profileError });

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          await supabase.auth.signOut();
          return { success: false, error: 'Error verifying admin privileges. Please try regular login.' };
        }

        if (!profile) {
          console.error('❌ No profile found for user');
          await supabase.auth.signOut();
          return { success: false, error: 'User profile not found. Please contact support.' };
        }

        console.log('📋 User role:', profile.role);

        if (profile.role !== 'admin' && profile.role !== 'superadmin') {
          console.error('❌ User is not admin, role:', profile.role);
          await supabase.auth.signOut();
          return { success: false, error: 'Access denied. Admin privileges required.' };
        }

        console.log('✅ Admin privileges verified');
      } catch (profileError) {
        console.error('❌ Exception checking admin role:', profileError);
        await supabase.auth.signOut();
        return { success: false, error: 'Error verifying admin privileges. Please try regular login.' };
      }

      console.log('✅ Admin login successful');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      // Mark that user explicitly logged out
      hasLoggedOut.current = true;
      
      // Sign out from Supabase FIRST (this clears server-side session)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase signout error:', error);
      } else {
        console.log('✅ Supabase session cleared');
      }
      
      // Clear ALL localStorage keys related to Supabase and auth
      try {
        // Clear our custom storage key
        localStorage.removeItem('eternal-rest-auth');
        
        // Clear all Supabase-related keys (Supabase stores multiple keys)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('eternal-rest'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed localStorage key: ${key}`);
        });
        
        console.log('✅ All auth localStorage cleared');
      } catch (storageError) {
        console.error('❌ Error clearing localStorage:', storageError);
      }
      
      // Clear React state AFTER clearing storage to prevent re-login
      setUser(null);
      setUserProfile(null);
      setIsSuperAdmin(false);
      setIsAdmin(false);
      setIsUser(false);
      setLoading(false);
      isLoadingProfileRef.current = false;
      
      console.log('✅ Local state cleared');
      console.log('✅ Logout completed successfully - User will stay logged out until explicit login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still ensure loading is false even on error
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: error.message };
    }
  };


  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Reload profile
      await loadUserProfile(user);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const resendEmailVerification = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Resend email verification error:', error);
      return { success: false, error: error.message };
    }
  };

  const sendVerificationCode = async (email) => {
    try {
      // Check if email already exists in profiles table
      console.log('🔍 Checking if email already exists:', email);
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is good (email available)
        console.error('❌ Error checking email availability:', checkError);
        throw new Error('Unable to verify email availability. Please try again.');
      }

      if (existingProfile) {
        console.log('❌ Email already registered:', email);
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      }

      console.log('✅ Email is available, proceeding with verification');

      // Generate verification code
      const code = EmailService.generateVerificationCode();
      
      // Store code in database
      const storeResult = await EmailService.storeVerificationCode(email, code);
      if (!storeResult.success) {
        throw new Error(storeResult.error);
      }

      // Send email
      const emailResult = await EmailService.sendVerificationCode(email, code);
      if (!emailResult.success) {
        throw new Error(emailResult.error);
      }

      return { success: true };
    } catch (error) {
      console.error('Send verification code error:', error);
      return { success: false, error: error.message };
    }
  };

  const verifyCode = async (email, code) => {
    try {
      const result = await EmailService.verifyCode(email, code);
      
      // If code verification is successful, just return success
      // The actual email confirmation will happen through Supabase's native system
      if (result.success) {
        return { success: true, verified: true };
      }
      
      return result;
    } catch (error) {
      console.error('Verify code error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    isUser,
    isSuperAdmin, // NEW: Export superadmin status
    loading,
    signUp,
    signIn,
    adminLogin,
    signOut,
    resendVerification,
    updateProfile,
    resendEmailVerification,
    sendVerificationCode,
    verifyCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};