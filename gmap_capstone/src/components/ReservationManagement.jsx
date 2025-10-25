import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load reservations from database
  useEffect(() => {
    const loadReservations = async () => {
      try {
        console.log('📋 Loading reservations from database...');
        
        const { data, error } = await supabase
          .from('plot_reservations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('✅ Loaded reservations:', data.length);
        setReservations(data || []);
        setLoading(false);

        // Show notification if there are new pending reservations
        const pendingCount = (data || []).filter(r => r.status === 'PENDING').length;
        if (pendingCount > 0) {
          setNotification(`You have ${pendingCount} pending reservation${pendingCount > 1 ? 's' : ''} to review.`);
          setTimeout(() => setNotification(null), 5000);
        }
      } catch (error) {
        console.error('❌ Error loading reservations:', error);
        setLoading(false);
      }
    };

    loadReservations();
  }, [refreshKey]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-purple-100 text-purple-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationTypeText = (type) => {
    switch (type) {
      case 'PRE_NEED': return 'Pre-Need Planning';
      case 'IMMEDIATE': return 'Immediate Need';
      case 'TRANSFER': return 'Transfer Ownership';
      default: return type;
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus, adminNotes = '') => {
    try {
      console.log('🔄 Updating reservation status...', { reservationId, newStatus });

      // Update in database
      const { error } = await supabase
        .from('plot_reservations')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (error) throw error;

      // Update local state
      setReservations(prev =>
        prev.map(reservation =>
          reservation.id === reservationId
            ? { ...reservation, status: newStatus, admin_notes: adminNotes }
            : reservation
        )
      );

      // Show success notification
      setNotification(`Reservation status updated to ${newStatus}`);
      setTimeout(() => setNotification(null), 3000);

      // Send email notification
      if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
        const reservation = reservations.find(r => r.id === reservationId);
        if (reservation) {
          try {
            console.log('📧 Sending email notification...');
            
            const { data, error: emailError } = await supabase.functions.invoke('send-reservation-notification', {
              body: {
                email: reservation.requestor_email,
                plotId: reservation.plot_id,
                reservationId: reservation.id,
                status: newStatus,
                beneficiaryName: reservation.beneficiary_name,
                requestorName: reservation.requestor_name,
                reservationType: reservation.reservation_type,
                adminNotes: adminNotes,
              }
            });

            if (emailError) {
              console.error('❌ Email sending error:', emailError);
              setNotification(`Status updated but email notification failed. Please contact user manually.`);
            } else {
              console.log('✅ Email notification sent successfully');
              setNotification(`Reservation ${newStatus} and email sent successfully!`);
            }
          } catch (emailError) {
            console.error('❌ Error sending email:', emailError);
          }
        }
      }

      // Trigger refresh
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 1000);

      // Update plot status if approved or active
      if (newStatus === 'ACTIVE') {
        const reservation = reservations.find(r => r.id === reservationId);
        if (reservation) {
          try {
            await supabase
              .from('plots')
              .update({ status: 'reserved' })
              .eq('plot_id', reservation.plot_id);
            
            console.log(`✅ Plot ${reservation.plot_id} marked as reserved`);
          } catch (plotError) {
            console.error('Error updating plot status:', plotError);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating reservation:', error);
      alert('Error updating reservation. Please try again.');
    }
  };

  const filteredReservations = reservations.filter(reservation => 
    filterStatus === 'all' || reservation.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-600 mr-2"></i>
            <span className="text-green-800 font-medium">{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🏷️ Plot Reservations</h2>
            <p className="text-gray-600 mt-1">Manage plot reservation requests and payments</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isRefreshing 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Reservations</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="ACTIVE">Active</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-dollar-sign text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'PAID').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-double text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Reservation Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plot & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.beneficiary_name}
                        {reservation.is_for_self && <span className="ml-2 text-xs text-blue-600">(Self)</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        Requestor: {reservation.requestor_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.requestor_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.plot_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getReservationTypeText(reservation.reservation_type)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                    {reservation.created_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(reservation.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {reservation.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(reservation.id, 'APPROVED', 'Reservation approved by admin')}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(reservation.id, 'REJECTED', 'Reservation rejected by admin')}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {reservation.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(reservation.id, 'PAID', 'Payment confirmed')}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Mark Paid
                        </button>
                      )}
                      {reservation.status === 'PAID' && (
                        <button
                          onClick={() => handleStatusUpdate(reservation.id, 'ACTIVE', 'Reservation activated')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Reservation Details</h3>
                  <p className="text-blue-100 mt-1">
                    {selectedReservation.beneficiary_name} - {selectedReservation.plot_id}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Reservation Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Beneficiary Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-600">{selectedReservation.beneficiary_name}</span>
                      {selectedReservation.is_for_self && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Self</span>
                      )}
                    </div>
                    {!selectedReservation.is_for_self && (
                      <div>
                        <span className="font-medium text-gray-700">Relationship:</span>
                        <span className="ml-2 text-gray-600 capitalize">{selectedReservation.beneficiary_relationship}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Requestor:</span>
                      <span className="ml-2 text-gray-600">{selectedReservation.requestor_name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-600">{selectedReservation.requestor_email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="ml-2 text-gray-600">{selectedReservation.requestor_phone}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Address:</span>
                      <span className="ml-2 text-gray-600">{selectedReservation.requestor_address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Reservation Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Plot ID:</span>
                    <span className="ml-2 text-gray-600">{selectedReservation.plot_id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reservation Type:</span>
                    <span className="ml-2 text-gray-600">{getReservationTypeText(selectedReservation.reservation_type)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Request Date:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(selectedReservation.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Documents</h4>
                <div className="space-y-2">
                  {selectedReservation.valid_id_url && (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-gray-700">Valid Government ID</span>
                      <a
                        href={selectedReservation.valid_id_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Document →
                      </a>
                    </div>
                  )}
                  {selectedReservation.proof_of_relationship_url && (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-gray-700">Proof of Relationship</span>
                      <a
                        href={selectedReservation.proof_of_relationship_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Document →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedReservation.admin_notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Admin Notes</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-700">{selectedReservation.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;

