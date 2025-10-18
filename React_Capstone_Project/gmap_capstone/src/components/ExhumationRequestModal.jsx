import React, { useState, useEffect } from 'react';
import DataService from '../services/DataService';
import PlotSelectionMap from './PlotSelectionMap';

const ExhumationRequestModal = ({ isOpen, onClose, plotData, onSubmit }) => {
  const [formData, setFormData] = useState({
    deceasedName: plotData?.occupant_name || '',
    plotId: plotData?.plot_id || '',
    section: plotData?.section || '',
    level: plotData?.level || '',
    plotNumber: plotData?.plot_number || '',
    nextOfKin: '',
    contactNumber: '',
    relationship: '',
    reason: '',
    alternativeLocation: '',
    selectedDestinationPlot: '',
    customLocation: '',
    specialInstructions: '',
    documents: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePlots, setAvailablePlots] = useState([]);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [showPlotSelectionMap, setShowPlotSelectionMap] = useState(false);

  // Load available plots when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailablePlots();
    }
  }, [isOpen]);

  const loadAvailablePlots = async () => {
    try {
      setLoadingPlots(true);
      const plots = await DataService.getAllPlots();
      // Filter for available plots only (for dropdown)
      const available = plots.filter(plot => 
        !plot.occupant_name || plot.occupant_name.trim() === ''
      );
      setAvailablePlots(available);
    } catch (error) {
      console.error('Error loading available plots:', error);
      setAvailablePlots([]);
    } finally {
      setLoadingPlots(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handlePlotSelected = (selectedPlot) => {
    setFormData(prev => ({
      ...prev,
      selectedDestinationPlot: selectedPlot.plot_id,
      customLocation: `${selectedPlot.plot_id.toUpperCase()} - ${selectedPlot.section || 'Unknown Section'}${selectedPlot.level ? ` (Level ${selectedPlot.level})` : ''}`
    }));
    setShowPlotSelectionMap(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nextOfKin.trim()) {
      newErrors.nextOfKin = 'Next of kin is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for exhumation is required';
    }

    if (formData.documents.length === 0) {
      newErrors.documents = 'At least one supporting document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submit clicked!');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form data being submitted:', formData);
    setIsSubmitting(true);

    try {
      // Prepare data for database
      const requestData = {
        plot_id: formData.plotId,
        deceased_name: formData.deceasedName,
        next_of_kin: formData.nextOfKin,
        contact_number: formData.contactNumber,
        relationship: formData.relationship,
        reason: formData.reason,
        alternative_location: formData.selectedDestinationPlot || formData.customLocation || formData.alternativeLocation,
        special_instructions: formData.specialInstructions,
        documents: formData.documents,
        status: 'pending'
      };
      
      console.log('Saving to database with data:', requestData);
      
      // Save to database
      let savedRequest;
      try {
        savedRequest = await DataService.createExhumationRequest(requestData);
        console.log('Exhumation request saved successfully to database:', savedRequest);
      } catch (dbError) {
        console.warn('Database save failed, storing in localStorage:', dbError);
        // Fallback: store in localStorage
        const existingRequests = JSON.parse(localStorage.getItem('exhumationRequests') || '[]');
        const newRequest = {
          ...requestData,
          id: Date.now(), // Generate temporary ID
          request_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        existingRequests.push(newRequest);
        localStorage.setItem('exhumationRequests', JSON.stringify(existingRequests));
        savedRequest = newRequest;
        console.log('Request saved to localStorage:', savedRequest);
      }
      
      // Show success message
      alert('Exhumation request submitted successfully! Your request has been sent to the admin for review. You will be contacted within 2-3 business days.');
      
      const exhumationRequest = {
        ...formData,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        adminNotes: '',
        exhumationDate: null,
        exhumationTeam: ''
      };

      await onSubmit(exhumationRequest);
      onClose();
    } catch (error) {
      console.error('Error submitting exhumation request:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Error submitting request: ${error.message}`);
      setErrors({ submit: 'Failed to submit request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🏺 Exhumation Request</h2>
              <p className="text-purple-100 mt-1">
                Request exhumation for {formData.deceasedName} - {formData.plotId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plot Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Plot Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deceased Name</label>
                  <input
                    type="text"
                    value={formData.deceasedName}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plot ID</label>
                  <input
                    type="text"
                    value={formData.plotId}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level & Plot</label>
                  <input
                    type="text"
                    value={`Level ${formData.level} - ${formData.plotNumber}`}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Requester Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">👤 Requester Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next of Kin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nextOfKin"
                    value={formData.nextOfKin}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.nextOfKin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Full name of next of kin"
                  />
                  {errors.nextOfKin && (
                    <p className="text-red-500 text-xs mt-1">{errors.nextOfKin}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Phone number"
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.relationship ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.relationship && (
                    <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Exhumation Details */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Exhumation Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Exhumation <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select reason</option>
                    <option value="family_relocation">Family decision to relocate remains</option>
                    <option value="cemetery_expansion">Cemetery expansion project</option>
                    <option value="legal_requirement">Legal requirement</option>
                    <option value="investigation">Investigation purposes</option>
                    <option value="medical_examination">Medical examination</option>
                    <option value="other">Other (specify in instructions)</option>
                  </select>
                  {errors.reason && (
                    <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Plot Selection
                  </label>
                  <div className="space-y-3">
                    {/* Interactive Map Selection */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Choose from Interactive Map
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPlotSelectionMap(true)}
                        className="w-full p-3 border-2 border-dashed border-blue-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span className="text-blue-600">🗺️</span>
                        <span className="text-blue-600 font-medium">Select Plot from Map</span>
                      </button>
                      {formData.selectedDestinationPlot && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            <strong>Selected:</strong> {formData.customLocation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Plot Selection Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Or choose from dropdown
                      </label>
                      <select
                        name="selectedDestinationPlot"
                        value={formData.selectedDestinationPlot}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        disabled={loadingPlots}
                      >
                        <option value="">Select a plot...</option>
                        {availablePlots.map(plot => (
                          <option key={plot.plot_id} value={plot.plot_id}>
                            {plot.plot_id.toUpperCase()} - {plot.section || 'Unknown Section'} 
                            {plot.level && ` (Level ${plot.level})`}
                          </option>
                        ))}
                      </select>
                      {loadingPlots && (
                        <p className="text-xs text-gray-500 mt-1">Loading available plots...</p>
                      )}
                      {!loadingPlots && availablePlots.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">No available plots found</p>
                      )}
                    </div>
                    
                    {/* Custom Location Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Or specify custom location
                      </label>
                      <input
                        type="text"
                        name="customLocation"
                        value={formData.customLocation}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter custom location (e.g., 'New Cemetery, Manila')"
                      />
                    </div>
                    
                    {/* Legacy field for backward compatibility */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Additional Notes
                      </label>
                      <input
                        type="text"
                        name="alternativeLocation"
                        value={formData.alternativeLocation}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Any additional location details..."
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Any special requirements or instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Supporting Documents</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Documents <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX
                </p>
                {errors.documents && (
                  <p className="text-red-500 text-xs mt-1">{errors.documents}</p>
                )}
              </div>

              {/* Uploaded Documents List */}
              {formData.documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                  <div className="space-y-2">
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-800 mb-2">⚠️ Important Notice</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Exhumation requests require proper legal documentation</li>
                <li>• All family members must provide consent</li>
                <li>• Exhumation may take 2-4 weeks to process</li>
                <li>• Additional fees may apply for exhumation services</li>
                <li>• Plot will be marked as "exhumed" after completion</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Plot Selection Map Modal */}
      <PlotSelectionMap
        isOpen={showPlotSelectionMap}
        onClose={() => setShowPlotSelectionMap(false)}
        onPlotSelected={handlePlotSelected}
        currentPlotId={formData.plotId}
      />
    </div>
  );
};

export default ExhumationRequestModal;