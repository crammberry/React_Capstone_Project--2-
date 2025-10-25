import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminPlotEditForm from './AdminPlotEditForm';
import './PlotDetailsModal.css';

const PlotDetailsModal = ({ plot, onClose, onRequestExhumation, onReservePlot, onPlotUpdated }) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [showAdminEdit, setShowAdminEdit] = useState(false);

  if (!plot) return null;

  const isOccupied = plot.status === 'occupied';
  const isAvailable = plot.status === 'available';
  const isReserved = plot.status === 'reserved';

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div style={{
          background: 'linear-gradient(to right, #2563eb, #0891b2)',
          color: 'white',
          padding: '16px 20px',
          minHeight: '80px',
          maxHeight: '80px',
          height: '80px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, lineHeight: '1.2' }}>
                Plot {plot.plot_id}
              </h2>
              <p style={{ fontSize: '13px', opacity: 0.9, margin: 0, marginTop: '4px', lineHeight: '1.2' }}>
                {plot.section} • Level {plot.level}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0',
                opacity: 0.8,
                fontSize: '24px',
                lineHeight: '1',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ✕
            </button>
          </div>
          
          {/* Status Badge */}
          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: isOccupied ? 'rgba(239, 68, 68, 0.2)' :
                             isReserved ? 'rgba(234, 179, 8, 0.2)' :
                             'rgba(34, 197, 94, 0.2)',
              color: isOccupied ? '#fecaca' :
                     isReserved ? '#fef08a' :
                     '#bbf7d0'
            }}>
              {isOccupied ? '👤 Occupied' : isReserved ? '🔒 Reserved' : '✅ Available'}
            </span>
          </div>
        </div>

        {/* Compact Tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '32px', padding: '0 24px' }}>
            <button
              onClick={() => setActiveTab('details')}
              style={{
                padding: '12px 4px',
                fontWeight: '500',
                fontSize: '13px',
                color: activeTab === 'details' ? '#2563eb' : '#6b7280',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'details' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => { if (activeTab !== 'details') e.target.style.color = '#374151' }}
              onMouseLeave={(e) => { if (activeTab !== 'details') e.target.style.color = '#6b7280' }}
            >
              Details
            </button>
            {isOccupied && (
              <button
                onClick={() => setActiveTab('occupant')}
                style={{
                  padding: '12px 4px',
                  fontWeight: '500',
                  fontSize: '13px',
                  color: activeTab === 'occupant' ? '#2563eb' : '#6b7280',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'occupant' ? '2px solid #2563eb' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.15s'
                }}
                onMouseEnter={(e) => { if (activeTab !== 'occupant') e.target.style.color = '#374151' }}
                onMouseLeave={(e) => { if (activeTab !== 'occupant') e.target.style.color = '#6b7280' }}
              >
                Occupant Info
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-visible">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Plot ID</p>
                  <p className="font-medium">{plot.plot_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Section</p>
                  <p className="font-medium">{plot.section}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium">Level {plot.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plot Number</p>
                  <p className="font-medium">{plot.plot_number}</p>
                </div>
              </div>

              {plot.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{plot.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'occupant' && isOccupied && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Deceased Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{plot.occupant_name || 'N/A'}</p>
                  </div>
                  {plot.date_of_interment && (
                    <div>
                      <p className="text-sm text-gray-500">Date of Interment</p>
                      <p className="font-medium">
                        {new Date(plot.date_of_interment).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {plot.age && (
                    <div>
                      <p className="text-sm text-gray-500">Age at Death</p>
                      <p className="font-medium">{plot.age} years</p>
                    </div>
                  )}
                  {plot.religion && (
                    <div>
                      <p className="text-sm text-gray-500">Religion</p>
                      <p className="font-medium">{plot.religion}</p>
                    </div>
                  )}
                </div>
              </div>

              {(plot.family_name || plot.next_of_kin) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Family Information</h3>
                  <div className="space-y-2">
                    {plot.family_name && (
                      <div>
                        <p className="text-sm text-gray-500">Family Name</p>
                        <p className="font-medium">{plot.family_name}</p>
                      </div>
                    )}
                    {plot.next_of_kin && (
                      <div>
                        <p className="text-sm text-gray-500">Next of Kin</p>
                        <p className="font-medium">{plot.next_of_kin}</p>
                      </div>
                    )}
                    {plot.contact_number && (
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium">{plot.contact_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions - Regular Users */}
        {user && !isAdmin && (
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px', backgroundColor: '#f9fafb' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Available Plot - Reserve */}
              {isAvailable && (
                <button
                  className="plot-modal-action-btn"
                  onClick={() => {
                    onReservePlot(plot);
                    onClose();
                  }}
                  style={{ backgroundColor: '#16a34a' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                  <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Reserve Plot</span>
                </button>
              )}

              {/* Occupied Plot - Request Exhumation */}
              {isOccupied && (
                <button
                  className="plot-modal-action-btn"
                  onClick={() => {
                    onRequestExhumation(plot, 'OUT');
                    onClose();
                  }}
                  style={{ backgroundColor: '#ea580c' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c2410c'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ea580c'}
                >
                  <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Request Exhumation</span>
                </button>
              )}

              {/* Available or Reserved Plot - Request Burial (Exhumation IN) */}
              {(isAvailable || isReserved) && (
                <button
                  className="plot-modal-action-btn"
                  onClick={() => {
                    onRequestExhumation(plot, 'IN');
                    onClose();
                  }}
                  style={{ backgroundColor: '#2563eb' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Request Burial</span>
                </button>
              )}

              <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '4px' }}>
                Requests require admin approval
              </p>
            </div>
          </div>
        )}

        {/* Actions - Admin */}
        {user && isAdmin && (
          <div style={{
            borderTop: '1px solid #d1d5db',
            padding: '12px 16px',
            backgroundColor: 'white',
            flexShrink: 0
          }}>
            <button
              onClick={() => setShowAdminEdit(true)}
              style={{
                width: '100%',
                minHeight: '36px',
                maxHeight: '36px',
                height: '36px',
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background-color 0.15s',
                lineHeight: '1',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <span>✏️ Edit Plot Details</span>
            </button>
          </div>
        )}

        {!user && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <p className="text-center text-gray-600">
              Please <button onClick={onClose} className="text-blue-600 hover:underline font-medium">log in</button> to make requests
            </p>
          </div>
        )}
      </div>

      {/* Admin Edit Form Modal */}
      {showAdminEdit && (
        <AdminPlotEditForm
          plot={plot}
          onClose={() => setShowAdminEdit(false)}
          onSuccess={() => {
            setShowAdminEdit(false);
            onClose(); // Close the main modal
            onPlotUpdated?.(); // Refresh the map data
          }}
        />
      )}
    </div>,
    document.body
  );
};

export default PlotDetailsModal;

