import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase/config';
import FileUpload from './FileUpload';

const ExhumationRequestForm = ({ plot, requestType, onClose, onSuccess }) => {
  const { user, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    // Deceased info
    deceased_name: '',
    deceased_date_of_death: '',
    deceased_date_of_burial: '',
    deceased_relationship: '',
    
    // Requestor info (pre-filled from profile)
    requestor_name: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || '',
    requestor_email: user?.email || '',
    requestor_phone: userProfile?.contact_number || '',
    requestor_address: userProfile?.address || '',
    
    // Exhumation details
    reason_for_exhumation: '',
    preferred_date: '',
    new_location: '',
    
    // Documents
    valid_id: null,
    death_certificate: null,
    birth_certificate: null,
    affidavit: null,
    burial_permit: null,
  });

  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const validateStep = (step) => {
    setError(null);
    
    switch (step) {
      case 1: // Deceased Info
        if (!formData.deceased_name.trim()) {
          setError('Deceased name is required');
          return false;
        }
        if (!formData.deceased_date_of_death) {
          setError('Date of death is required');
          return false;
        }
        if (!formData.deceased_relationship.trim()) {
          setError('Your relationship to the deceased is required');
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
        if (!formData.requestor_address.trim()) {
          setError('Address is required');
          return false;
        }
        break;
        
      case 3: // Exhumation Details
        if (!formData.reason_for_exhumation.trim()) {
          setError('Reason for exhumation is required');
          return false;
        }
        if (requestType === 'OUT' && !formData.new_location.trim()) {
          setError('New location for remains is required');
          return false;
        }
        break;
        
      case 4: // Documents
        if (!formData.valid_id) {
          setError('Valid ID is required');
          return false;
        }
        if (!formData.death_certificate) {
          setError('Death certificate is required');
          return false;
        }
        if (!formData.birth_certificate) {
          setError('Birth certificate is required (to prove relationship)');
          return false;
        }
        if (!formData.affidavit) {
          setError('Affidavit is required');
          return false;
        }
        break;
        
      default:
        return true;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${path}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('exhumation-documents')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('exhumation-documents')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload all documents
      console.log('📤 Uploading documents...');
      const [validIdUrl, deathCertUrl, birthCertUrl, affidavitUrl, burialPermitUrl] = await Promise.all([
        uploadFile(formData.valid_id, 'valid_id'),
        uploadFile(formData.death_certificate, 'death_cert'),
        uploadFile(formData.birth_certificate, 'birth_cert'),
        uploadFile(formData.affidavit, 'affidavit'),
        uploadFile(formData.burial_permit, 'burial_permit'),
      ]);
      
      // Create exhumation request
      console.log('💾 Creating exhumation request...');
      const { data, error: insertError } = await supabase
        .from('exhumation_requests')
        .insert({
          user_id: user.id,
          plot_id: plot.plot_id,
          request_type: requestType,
          deceased_name: formData.deceased_name,
          deceased_date_of_death: formData.deceased_date_of_death,
          deceased_date_of_burial: formData.deceased_date_of_burial || null,
          deceased_relationship: formData.deceased_relationship,
          requestor_name: formData.requestor_name,
          requestor_email: formData.requestor_email,
          requestor_phone: formData.requestor_phone,
          requestor_address: formData.requestor_address,
          reason_for_exhumation: formData.reason_for_exhumation,
          preferred_date: formData.preferred_date || null,
          new_location: formData.new_location || null,
          valid_id_url: validIdUrl,
          death_certificate_url: deathCertUrl,
          birth_certificate_url: birthCertUrl,
          affidavit_url: affidavitUrl,
          burial_permit_url: burialPermitUrl,
          status: 'PENDING',
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      console.log('✅ Exhumation request created:', data);
      
      // Success!
      if (onSuccess) {
        onSuccess(data);
      }
      
      onClose();
      
      // Show success message
      alert(`Exhumation request submitted successfully!\n\nRequest ID: ${data.id}\n\nYou will receive an email once your request is reviewed by our admin team.`);
      
    } catch (err) {
      console.error('❌ Error submitting request:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!plot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          requestType === 'OUT' 
            ? 'from-orange-600 to-red-600' 
            : 'from-blue-600 to-purple-600'
        } text-white p-6`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {requestType === 'OUT' ? 'Exhumation Request (Remove Remains)' : 'Burial Request (Place Remains)'}
              </h2>
              <p className="text-white/90">Plot: {plot.plot_id} • {plot.section}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Deceased Info</span>
            <span>Your Info</span>
            <span>Details</span>
            <span>Documents</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Deceased Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Deceased Person Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name of Deceased *
                </label>
                <input
                  type="text"
                  name="deceased_name"
                  value={formData.deceased_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Death *
                  </label>
                  <input
                    type="date"
                    name="deceased_date_of_death"
                    value={formData.deceased_date_of_death}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Burial {requestType === 'OUT' && '*'}
                  </label>
                  <input
                    type="date"
                    name="deceased_date_of_burial"
                    value={formData.deceased_date_of_burial}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Relationship to the Deceased *
                </label>
                <select
                  name="deceased_relationship"
                  value={formData.deceased_relationship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Grandchild">Grandchild</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Other Relative">Other Relative</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Requestor Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Your Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="requestor_name"
                  value={formData.requestor_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="requestor_email"
                    value={formData.requestor_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="requestor_phone"
                    value={formData.requestor_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="09XX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Address *
                </label>
                <textarea
                  name="requestor_address"
                  value={formData.requestor_address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your complete address"
                />
              </div>
            </div>
          )}

          {/* Step 3: Exhumation Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Exhumation Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for {requestType === 'OUT' ? 'Exhumation' : 'Burial'} *
                </label>
                <textarea
                  name="reason_for_exhumation"
                  value={formData.reason_for_exhumation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide detailed reason..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleInputChange}
                  min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 7 days from today
                </p>
              </div>

              {requestType === 'OUT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Location for Remains *
                  </label>
                  <textarea
                    name="new_location"
                    value={formData.new_location}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Where will the remains be transferred?"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Please upload clear, legible copies of the following documents. All documents are required.
              </p>

              <FileUpload
                label="Valid ID *"
                description="Government-issued ID (PhilID, Driver's License, Passport, etc.)"
                accept="image/*,.pdf"
                onChange={(file) => handleFileChange('valid_id', file)}
                value={formData.valid_id}
              />

              <FileUpload
                label="Death Certificate *"
                description="Official death certificate of the deceased"
                accept="image/*,.pdf"
                onChange={(file) => handleFileChange('death_certificate', file)}
                value={formData.death_certificate}
              />

              <FileUpload
                label="Birth Certificate *"
                description="Your birth certificate (to prove relationship)"
                accept="image/*,.pdf"
                onChange={(file) => handleFileChange('birth_certificate', file)}
                value={formData.birth_certificate}
              />

              <FileUpload
                label="Affidavit *"
                description="Notarized affidavit stating your relationship and reason for request"
                accept="image/*,.pdf"
                onChange={(file) => handleFileChange('affidavit', file)}
                value={formData.affidavit}
              />

              <FileUpload
                label="Burial Permit (Optional)"
                description="Original burial permit, if available"
                accept="image/*,.pdf"
                onChange={(file) => handleFileChange('burial_permit', file)}
                value={formData.burial_permit}
              />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 p-6 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExhumationRequestForm;

