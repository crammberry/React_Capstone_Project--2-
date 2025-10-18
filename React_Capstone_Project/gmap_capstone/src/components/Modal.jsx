import React, { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full ${sizeClasses[size]} max-h-[85vh] overflow-y-auto shadow-2xl mx-auto`} style={{ marginTop: '-2vh' }}>
        <div className="flex justify-between items-center p-8 border-b border-gray-200">
          <h3 className="text-2xl text-slate-700 font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

const AdminLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(credentials);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Login">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
            required
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-semibold mb-2">Demo Credentials:</p>
          <p className="text-sm text-blue-700 mb-1">Username: admin</p>
          <p className="text-sm text-blue-700">Password: admin123</p>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-300"
          >
            Login
          </button>
        </div>
      </form>
    </Modal>
  );
};

const PlotModal = ({ isOpen, onClose, plotData, onSave, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    plot: '',
    section: '',
    level: '',
    tombNumber: '',
    dateOfInterment: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    if (plotData) {
      setFormData(plotData);
    }
  }, [plotData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Auto-generate plot ID based on actual cemetery structure
    const plotData = {
      ...formData,
      plot: formData.section && formData.level && formData.tombNumber ? 
        (formData.section.includes('lb-') || formData.section.includes('rb-') ? 
          `${formData.section}${formData.tombNumber.toLowerCase()}` : 
          `${formData.section}-level${formData.level}-${formData.tombNumber}`) : 
        formData.plot
    };
    
    onSave(plotData);
  };

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    
    // Auto-update status based on name field (unless manually overridden)
    if (e.target.name === 'name') {
      if (e.target.value.trim() === '') {
        // If name is empty, set to available and clear related fields
        newFormData.status = 'available';
        newFormData.dateOfInterment = '';
        newFormData.notes = '';
      } else {
        // If name has value and status is not manually set to 'reserved', set to occupied
        if (newFormData.status !== 'reserved') {
          newFormData.status = 'occupied';
        }
        // If date of interment is not set, set it to today
        if (!newFormData.dateOfInterment) {
          newFormData.dateOfInterment = new Date().toISOString().split('T')[0];
        }
      }
    }
    
    // Reset plot number, level, and tomb number when section changes
    if (e.target.name === 'section') {
      newFormData.plot = '';
      newFormData.level = '';
      newFormData.tombNumber = '';
    }
    
    // Reset tomb number when level changes
    if (e.target.name === 'level') {
      newFormData.tombNumber = '';
    }
    
    setFormData(newFormData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Plot" : "Add New Plot"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Information Section */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <i className="fas fa-info-circle text-blue-600"></i>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Actual Cemetery Structure</h4>
              <p className="text-blue-700 text-sm mb-2">
                Our cemetery uses your actual Inkscape-drawn structure:
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• <strong>Left Block (LB):</strong> LB 4, 6, 8, 10, 12, 14, 16, 18, 20, 22</li>
                <li>• <strong>Right Block (RB):</strong> RB 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23</li>
                <li>• <strong>Apartments:</strong> 2nd Level, IV, V with higher chance of multiple levels</li>
                <li>• <strong>Special Sections:</strong> Veterans, Office, Eternal Tomb, Restos Bonecrypt</li>
                <li>• <strong>Plot IDs:</strong> LB/RB use "lb-4a", "rb-23f" format; Apartments use "section-levelX-tomb"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Occupant Name <span className="text-xs text-gray-500">(Leave empty for available plot)</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter occupant name to mark as occupied..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Plot ID <span className="text-xs text-gray-500">(Auto-generated)</span>
            </label>
            <input
              type="text"
              name="plot"
              value={formData.section && formData.level && formData.tombNumber ? 
                (formData.section.includes('lb-') || formData.section.includes('rb-') ? 
                  `${formData.section}${formData.tombNumber.toLowerCase()}` : 
                  `${formData.section}-level${formData.level}-${formData.tombNumber}`) : 
                'Select section, level, and tomb number first'
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Section
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              required
            >
              <option value="">Select Section</option>
              <optgroup label="Left Block Sections">
                <option value="lb-4">LB 4</option>
                <option value="lb-6">LB 6</option>
                <option value="lb-8">LB 8</option>
                <option value="lb-10">LB 10</option>
                <option value="lb-12">LB 12</option>
                <option value="lb-14">LB 14</option>
                <option value="lb-16">LB 16</option>
                <option value="lb-18">LB 18</option>
                <option value="lb-20">LB 20</option>
                <option value="lb-22">LB 22</option>
              </optgroup>
              <optgroup label="Right Block Sections">
                <option value="rb-1">RB 1</option>
                <option value="rb-3">RB 3</option>
                <option value="rb-5">RB 5</option>
                <option value="rb-7">RB 7</option>
                <option value="rb-9">RB 9</option>
                <option value="rb-11">RB 11</option>
                <option value="rb-13">RB 13</option>
                <option value="rb-15">RB 15</option>
                <option value="rb-17">RB 17</option>
                <option value="rb-19">RB 19</option>
                <option value="rb-21">RB 21</option>
                <option value="rb-23">RB 23</option>
              </optgroup>
              <optgroup label="Apartment Sections">
                <option value="apartment-2nd-level">Apartment 2nd Level</option>
                <option value="apartment-iv">Apartment IV</option>
                <option value="apartment-v">Apartment V</option>
              </optgroup>
              <optgroup label="Special Sections">
                <option value="veterans">Veterans</option>
                <option value="office">Office</option>
                <option value="eternal-tomb">Eternal Tomb</option>
                <option value="restos-bonecrypt">Restos Bonecrypt</option>
              </optgroup>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              required
            >
              <option value="">Select Level</option>
              {formData.section && (
                <>
                  <option value="1">Level 1</option>
                  {(() => {
                    // Determine available levels based on section
                    const sectionSeed = formData.section.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const randomSeed = (sectionSeed * 9301 + 49297) % 233280;
                    const normalizedSeed = randomSeed / 233280;
                    
                    if (formData.section.includes('apartment')) {
                      // Apartments have higher chance of multiple levels
                      if (normalizedSeed > 0.7) {
                        return (
                          <>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                          </>
                        );
                      } else if (normalizedSeed > 0.4) {
                        return <option value="2">Level 2</option>;
                      }
                    } else {
                      // Mausoleums: 70% chance of Level 2, 30% only Level 1
                      if (normalizedSeed > 0.3) {
                        return <option value="2">Level 2</option>;
                      }
                    }
                    return null;
                  })()}
                </>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tomb Number
            </label>
            <select
              name="tombNumber"
              value={formData.tombNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
              required
            >
              <option value="">Select Tomb Number</option>
              {formData.level && (
                <>
                  {(() => {
                    // Generate tomb numbers based on section type and level
                    if (formData.section.includes('lb-') || formData.section.includes('rb-')) {
                      // For LB/RB sections, use letters A-F
                      const numTombs = formData.level === '1' ? 6 : (formData.level === '2' ? 4 : 3);
                      return Array.from({length: numTombs}, (_, i) => (
                        <option key={i} value={String.fromCharCode(97 + i)}>
                          {String.fromCharCode(65 + i)}
                        </option>
                      ));
                    } else {
                      // For apartment and special sections, use letters A-D
                      const numTombs = formData.level === '1' ? 4 : (formData.level === '2' ? 3 : 2);
                      return Array.from({length: numTombs}, (_, i) => (
                        <option key={i+1} value={String.fromCharCode(64 + i + 1)}>
                          {String.fromCharCode(64 + i + 1)}
                        </option>
                      ));
                    }
                  })()}
                </>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Date of Interment
            </label>
            <input
              type="date"
              name="dateOfInterment"
              value={formData.dateOfInterment}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status <span className="text-xs text-gray-500">(Auto-updated)</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                formData.status === 'available' 
                  ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-100' 
                  : formData.status === 'occupied'
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                  : 'border-yellow-300 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-100'
              }`}
            >
              <option value="available">Available (Green)</option>
              <option value="occupied">Occupied (Red)</option>
              <option value="reserved">Reserved (Yellow)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.trim() 
                ? formData.status === 'reserved' 
                  ? "Status manually set to 'Reserved' - won't auto-change"
                  : "Status auto-set to 'Occupied' when name is entered"
                : "Enter occupant name to auto-set status to 'Occupied', or manually select 'Reserved'"
              }
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-vertical"
            placeholder="Additional notes about this plot..."
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-300"
          >
            {isEdit ? "Update Plot" : "Add Plot"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export { Modal, AdminLoginModal, PlotModal };
