import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DataService from '../services/DataService';

const AdminPlotEditForm = ({ plot, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    plot_id: '',
    section: '',
    level: '',
    plot_number: '',
    status: 'available',
    occupant_name: '',
    date_of_birth: '',
    date_of_death: '',
    date_of_burial: '',
    age: '',
    cause_of_death: '',
    religion: '',
    family_name: '',
    next_of_kin: '',
    contact_number: '',
    address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (plot) {
      setFormData({
        plot_id: plot.plot_id || '',
        section: plot.section || '',
        level: plot.level || '',
        plot_number: plot.plot_number || plot.plotNumber || '',
        status: plot.status || 'available',
        occupant_name: plot.occupant_name || plot.name || '',
        date_of_birth: plot.date_of_birth || '',
        date_of_death: plot.date_of_death || '',
        date_of_burial: plot.date_of_burial || plot.dateOfInterment || '',
        age: plot.age || '',
        cause_of_death: plot.cause_of_death || plot.causeOfDeath || '',
        religion: plot.religion || '',
        family_name: plot.family_name || plot.familyName || '',
        next_of_kin: plot.next_of_kin || plot.nextOfKin || '',
        contact_number: plot.contact_number || plot.contactNumber || '',
        address: plot.address || '',
        notes: plot.notes || ''
      });
    }
  }, [plot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };

      // Auto-calculate age if both dates are provided
      if (name === 'date_of_birth' || name === 'date_of_death') {
        const dob = name === 'date_of_birth' ? value : prev.date_of_birth;
        const dod = name === 'date_of_death' ? value : prev.date_of_death;
        
        if (dob && dod) {
          const birthDate = new Date(dob);
          const deathDate = new Date(dod);
          const ageInYears = Math.floor((deathDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
          updated.age = ageInYears.toString();
        }
      }

      // Auto-determine status based on occupant information
      // If occupant_name is filled, status = 'occupied', otherwise 'available'
      if (name === 'occupant_name') {
        updated.status = value.trim() ? 'occupied' : 'available';
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.plot_id) {
        throw new Error('Plot ID is required');
      }

      // Auto-determine final status before saving
      const finalStatus = formData.occupant_name?.trim() ? 'occupied' : 'available';
      const dataToSave = {
        ...formData,
        status: finalStatus
      };

      // Confirm if changing to occupied status
      if (finalStatus === 'occupied' && plot?.status !== 'occupied' && formData.occupant_name) {
        const confirm = window.confirm(
          `This will mark the plot as OCCUPIED:\n\n` +
          `Plot: ${formData.plot_id}\n` +
          `Occupant: ${formData.occupant_name}\n\n` +
          `Continue?`
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      // Check if plot exists
      const existingPlot = await DataService.getPlot(formData.plot_id);
      
      let result;
      if (existingPlot) {
        // Update existing plot
        result = await DataService.updatePlot(formData.plot_id, dataToSave);
      } else {
        // Create new plot
        result = await DataService.createPlot(dataToSave);
      }

      if (result) {
        // Show success message
        alert(`✅ Plot ${formData.plot_id} saved successfully!`);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Error saving plot:', err);
      setError(err.message || 'Failed to save plot data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearPlot = async () => {
    const confirm = window.confirm(
      `⚠️ WARNING: Clear Plot Data\n\n` +
      `This will PERMANENTLY remove all occupant information from plot ${formData.plot_id}:\n\n` +
      `• Occupant Name: ${formData.occupant_name || 'N/A'}\n` +
      `• Family: ${formData.family_name || 'N/A'}\n` +
      `• All dates and personal information\n\n` +
      `The plot will be marked as AVAILABLE.\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you absolutely sure?`
    );
    
    if (!confirm) {
      return;
    }

    setLoading(true);
    try {
      await DataService.updatePlot(formData.plot_id, {
        ...formData,
        status: 'available',
        occupant_name: '',
        date_of_birth: '',
        date_of_death: '',
        date_of_burial: '',
        age: '',
        cause_of_death: '',
        religion: '',
        family_name: '',
        next_of_kin: '',
        contact_number: '',
        address: '',
        notes: ''
      });
      
      alert('✅ Plot cleared successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error clearing plot:', err);
      setError('Failed to clear plot data');
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key to close
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header - NO SVG */}
        <div style={{
          backgroundColor: '#6366f1',
          color: 'white',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          minHeight: '48px',
          maxHeight: '48px',
          height: '48px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflow: 'hidden'
          }}>
            <span style={{ fontSize: '16px', lineHeight: '1' }}>✏️</span>
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0, lineHeight: '1.2' }}>
                Edit Plot Details
              </h2>
              <p style={{ fontSize: '11px', opacity: 0.9, margin: 0, lineHeight: '1.2', marginTop: '2px' }}>
                {plot?.plot_id || 'New Plot'} • Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
              opacity: 0.8,
              transition: 'opacity 0.15s',
              fontSize: '20px',
              lineHeight: '1',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Plot Identification - Location (Read-Only) */}
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <h3 className="text-sm font-semibold text-gray-700">Plot Identification</h3>
              {plot?.plot_id && (
                <span className="text-xs text-gray-500 italic">🔒 Location cannot be changed</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="plot_id"
                  value={formData.plot_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    plot?.plot_id 
                      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="e.g., RB-L3-K1"
                  required
                  readOnly={!!plot?.plot_id}
                  disabled={!!plot?.plot_id}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    plot?.plot_id 
                      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="e.g., RB"
                  readOnly={!!plot?.plot_id}
                  disabled={!!plot?.plot_id}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <input
                  type="text"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    plot?.plot_id 
                      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="e.g., 3"
                  readOnly={!!plot?.plot_id}
                  disabled={!!plot?.plot_id}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot Number</label>
                <input
                  type="text"
                  name="plot_number"
                  value={formData.plot_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    plot?.plot_id 
                      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="e.g., K1"
                  readOnly={!!plot?.plot_id}
                  disabled={!!plot?.plot_id}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-xs text-gray-500 font-normal ml-2">🤖 Automatic</span>
              </label>
              <div className={`w-full px-3 py-2 border rounded-lg font-medium ${
                formData.status === 'occupied' 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {formData.status === 'occupied' ? '👤 Occupied' : '✅ Available'}
                <span className="text-xs ml-2 opacity-75">
                  {formData.status === 'occupied' 
                    ? '(Has occupant information)' 
                    : '(No occupant information)'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Status changes automatically when you add/remove occupant name
              </p>
            </div>
          </div>

          {/* Occupant Information */}
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Occupant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    💡 Adding a name marks plot as "Occupied"
                  </span>
                </label>
                <input
                  type="text"
                  name="occupant_name"
                  value={formData.occupant_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Full name of deceased (leave empty for available plots)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                  <span className="text-xs text-gray-500 ml-2 font-normal">💡 Click year to type it</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Death
                  <span className="text-xs text-gray-500 ml-2 font-normal">💡 Click year to type it</span>
                </label>
                <input
                  type="date"
                  name="date_of_death"
                  value={formData.date_of_death}
                  onChange={handleChange}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age at Death
                  <span className="text-xs text-gray-500 ml-2 font-normal">🤖 Auto-calculated</span>
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age ? `${formData.age} years` : 'Enter birth & death dates'}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Catholic, Muslim"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cause of Death</label>
                <input
                  type="text"
                  name="cause_of_death"
                  value={formData.cause_of_death}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Cause of death"
                />
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                <input
                  type="text"
                  name="family_name"
                  value={formData.family_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Surname or family name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin</label>
                <input
                  type="text"
                  name="next_of_kin"
                  value={formData.next_of_kin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Name of next of kin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                  <span className="text-xs text-gray-500 ml-2 font-normal">No format restrictions</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                  placeholder="Complete home address (any format)"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Additional Notes</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any additional notes or comments..."
            />
          </div>

        </form>

        {/* Action Buttons */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          {/* Clear Plot Button */}
          {plot?.plot_id && (
            <button
              type="button"
              onClick={handleClearPlot}
              disabled={loading}
              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Clear Plot
            </button>
          )}

          {!plot?.plot_id && <div></div>}

          <div className="flex gap-3">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>

            {/* Save Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminPlotEditForm;

