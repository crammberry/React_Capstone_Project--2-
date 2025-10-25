import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/config';
import FileUpload from './FileUpload';

const PlotReservationForm = ({ plot, onClose, onSuccess }) => {
  const { user, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    // Reservation type
    reservation_type: 'PRE_NEED', // PRE_NEED, IMMEDIATE, TRANSFER
    
    // Beneficiary info (who will be buried)
    is_for_self: false,
    beneficiary_name: '',
    beneficiary_relationship: '',
    
    // Requestor info (pre-filled from profile)
    requestor_name: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || '',
    requestor_email: user?.email || '',
    requestor_phone: userProfile?.contact_number || '',
    requestor_address: userProfile?.address || '',
    
    // Documents
    valid_id: null,
    proof_of_relationship: null,
  });

  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const validateStep = (step) => {
    setError(null);
    
    switch (step) {
      case 1: // Beneficiary Info
        if (!formData.is_for_self && !formData.beneficiary_name.trim()) {
          setError('Beneficiary name is required');
          return false;
        }
        if (!formData.is_for_self && !formData.beneficiary_relationship.trim()) {
          setError('Relationship to beneficiary is required');
          return false;
        }
        break;
        
      case 2: // Requestor Info
        if (!formData.requestor_name.trim()) {
          setError('Your name is required');
          return false;
        }
        if (!formData.requestor_email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!formData.requestor_phone.trim()) {
          setError('Phone number is required');
          return false;
        }
        if (formData.requestor_phone.length !== 11) {
          setError('Phone number must be exactly 11 digits');
          return false;
        }
        if (!formData.requestor_address.trim()) {
          setError('Address is required');
          return false;
        }
        break;
        
      case 3: // Reservation Details
        if (!formData.reservation_type) {
          setError('Please select a reservation type');
          return false;
        }
        break;
        
      case 4: // Documents
        if (!formData.valid_id) {
          setError('Valid Government ID is required');
          return false;
        }
        if (!formData.is_for_self && !formData.proof_of_relationship) {
          setError('Proof of relationship is required');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const uploadDocument = async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('exhumation-documents')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('exhumation-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📝 Starting reservation submission...');

      // Upload documents
      console.log('📤 Uploading documents...');
      const validIdUrl = await uploadDocument(formData.valid_id, 'reservation-ids');
      
      let proofOfRelationshipUrl = null;
      if (!formData.is_for_self && formData.proof_of_relationship) {
        proofOfRelationshipUrl = await uploadDocument(formData.proof_of_relationship, 'reservation-proofs');
      }

      console.log('✅ Documents uploaded');

      // Insert reservation request
      const reservationData = {
        user_id: user.id,
        plot_id: plot.plot_id,
        reservation_type: formData.reservation_type,
        is_for_self: formData.is_for_self,
        beneficiary_name: formData.is_for_self ? formData.requestor_name : formData.beneficiary_name,
        beneficiary_relationship: formData.is_for_self ? 'self' : formData.beneficiary_relationship,
        requestor_name: formData.requestor_name,
        requestor_email: formData.requestor_email,
        requestor_phone: formData.requestor_phone,
        requestor_address: formData.requestor_address,
        valid_id_url: validIdUrl,
        proof_of_relationship_url: proofOfRelationshipUrl,
        status: 'PENDING',
      };

      console.log('💾 Saving to database...');
      const { data, error: dbError } = await supabase
        .from('plot_reservations')
        .insert([reservationData])
        .select()
        .single();

      if (dbError) throw dbError;

      console.log('✅ Reservation saved:', data);

      // Success!
      onSuccess();
      
    } catch (err) {
      console.error('❌ Error submitting reservation:', err);
      setError(err.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!plot) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          padding: '24px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                🏷️ Reserve Plot
              </h2>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                Plot {plot.plot_id} • {plot.section}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '28px',
                padding: 0,
                opacity: 0.8,
                lineHeight: 1
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div style={{ padding: '24px 24px 0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            {[1, 2, 3, 4].map(step => (
              <div key={step} style={{ 
                flex: 1, 
                height: '4px', 
                backgroundColor: step <= currentStep ? '#3b82f6' : '#e5e7eb',
                marginRight: step < 4 ? '8px' : 0,
                borderRadius: '2px',
                transition: 'all 0.3s'
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
            <span style={{ fontWeight: currentStep === 1 ? '600' : '400', color: currentStep === 1 ? '#3b82f6' : '#6b7280' }}>Beneficiary</span>
            <span style={{ fontWeight: currentStep === 2 ? '600' : '400', color: currentStep === 2 ? '#3b82f6' : '#6b7280' }}>Contact Info</span>
            <span style={{ fontWeight: currentStep === 3 ? '600' : '400', color: currentStep === 3 ? '#3b82f6' : '#6b7280' }}>Details</span>
            <span style={{ fontWeight: currentStep === 4 ? '600' : '400', color: currentStep === 4 ? '#3b82f6' : '#6b7280' }}>Documents</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Step 1: Beneficiary Information */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Beneficiary Information
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
                Who will this plot be reserved for?
              </p>

              {/* Is for self checkbox */}
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_for_self"
                    checked={formData.is_for_self}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', marginRight: '12px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#1e40af' }}>
                    I am reserving this plot for myself
                  </span>
                </label>
              </div>

              {/* Beneficiary Name (only if not for self) */}
              {!formData.is_for_self && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Beneficiary Full Name *
                    </label>
                    <input
                      type="text"
                      name="beneficiary_name"
                      value={formData.beneficiary_name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Relationship to Beneficiary *
                    </label>
                    <select
                      name="beneficiary_relationship"
                      value={formData.beneficiary_relationship}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="sibling">Sibling</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="grandchild">Grandchild</option>
                      <option value="other">Other Relative</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Requestor Information */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Your Contact Information
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
                We'll use this information to contact you
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="requestor_name"
                  value={formData.requestor_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="requestor_email"
                  value={formData.requestor_email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Phone Number * (11 digits)
                </label>
                <input
                  type="tel"
                  name="requestor_phone"
                  value={formData.requestor_phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    handleInputChange({ target: { name: 'requestor_phone', value } });
                  }}
                  placeholder="09123456789"
                  required
                  maxLength="11"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${formData.requestor_phone && formData.requestor_phone.length > 0 && formData.requestor_phone.length !== 11 ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
                {formData.requestor_phone && (
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    {formData.requestor_phone.length === 11 ? (
                      <span style={{ color: '#10b981' }}>✓ Valid phone number</span>
                    ) : (
                      <span style={{ color: '#ef4444' }}>⚠️ Must be 11 digits ({formData.requestor_phone.length}/11)</span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Complete Address *
                </label>
                <textarea
                  name="requestor_address"
                  value={formData.requestor_address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address"
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Reservation Details */}
          {currentStep === 3 && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Reservation Details
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
                Please select your reservation type
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* PRE-NEED */}
                <label style={{
                  padding: '16px',
                  border: `2px solid ${formData.reservation_type === 'PRE_NEED' ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: formData.reservation_type === 'PRE_NEED' ? '#eff6ff' : 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <input
                      type="radio"
                      name="reservation_type"
                      value="PRE_NEED"
                      checked={formData.reservation_type === 'PRE_NEED'}
                      onChange={handleInputChange}
                      style={{ marginTop: '2px', marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#374151', marginBottom: '4px' }}>
                        Pre-Need Planning
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                        Reserve a plot in advance for future use. Payment plans available.
                      </div>
                    </div>
                  </div>
                </label>

                {/* IMMEDIATE */}
                <label style={{
                  padding: '16px',
                  border: `2px solid ${formData.reservation_type === 'IMMEDIATE' ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: formData.reservation_type === 'IMMEDIATE' ? '#eff6ff' : 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <input
                      type="radio"
                      name="reservation_type"
                      value="IMMEDIATE"
                      checked={formData.reservation_type === 'IMMEDIATE'}
                      onChange={handleInputChange}
                      style={{ marginTop: '2px', marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#374151', marginBottom: '4px' }}>
                        Immediate Need
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                        Need a plot for immediate burial. Expedited processing available.
                      </div>
                    </div>
                  </div>
                </label>

                {/* TRANSFER */}
                <label style={{
                  padding: '16px',
                  border: `2px solid ${formData.reservation_type === 'TRANSFER' ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: formData.reservation_type === 'TRANSFER' ? '#eff6ff' : 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <input
                      type="radio"
                      name="reservation_type"
                      value="TRANSFER"
                      checked={formData.reservation_type === 'TRANSFER'}
                      onChange={handleInputChange}
                      style={{ marginTop: '2px', marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#374151', marginBottom: '4px' }}>
                        Transfer Ownership
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                        Transfer ownership of an existing plot to a new owner.
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Required Documents
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
                Upload the following documents to process your reservation
              </p>

              {/* Valid ID */}
              <div style={{ marginBottom: '20px' }}>
                <FileUpload
                  label="Valid Government ID *"
                  description="Driver's License, Passport, PhilID, etc."
                  onFileSelect={(file) => handleFileChange('valid_id', file)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10}
                  required
                />
              </div>

              {/* Proof of Relationship (if not for self) */}
              {!formData.is_for_self && (
                <div style={{ marginBottom: '20px' }}>
                  <FileUpload
                    label="Proof of Relationship *"
                    description="Birth Certificate, Marriage Certificate, etc."
                    onFileSelect={(file) => handleFileChange('proof_of_relationship', file)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={10}
                    required
                  />
                </div>
              )}

              <div style={{
                padding: '16px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#92400e',
                lineHeight: '1.5'
              }}>
                <strong>⚠️ Important:</strong> All documents must be clear and legible. File size limit: 10MB per document.
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '2px solid #fca5a5',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                ← Back
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳ Submitting...' : '✓ Submit Reservation'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PlotReservationForm;

