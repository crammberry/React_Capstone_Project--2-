import React, { useState, useEffect } from 'react';
import DataService from '../services/DataService';

const ExhumationManagement = () => {
  const [exhumationRequests, setExhumationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load exhumation requests from database
  useEffect(() => {
    const loadRequests = async () => {
      try {
        let requests = [];
        
        try {
          // Try to load from database first
          requests = await DataService.getExhumationRequests();
          console.log('Loaded requests from database:', requests);
        } catch (dbError) {
          console.warn('Database load failed, checking localStorage:', dbError);
          // Fallback: load from localStorage
          const localRequests = JSON.parse(localStorage.getItem('exhumationRequests') || '[]');
          requests = localRequests;
          console.log('Loaded requests from localStorage:', requests);
        }
        
        // Also check localStorage even if database succeeds (for mixed data)
        const localRequests = JSON.parse(localStorage.getItem('exhumationRequests') || '[]');
        console.log('localStorage requests:', localRequests);
        
        // Combine database and localStorage requests (avoid duplicates)
        const allRequests = [...requests];
        localRequests.forEach(localRequest => {
          // Check if this request already exists in database results
          const exists = requests.some(dbRequest => 
            dbRequest.id === localRequest.id || 
            (dbRequest.plot_id === localRequest.plot_id && dbRequest.deceased_name === localRequest.deceased_name)
          );
          if (!exists) {
            allRequests.push(localRequest);
          }
        });
        
        requests = allRequests;
        console.log('Combined requests (database + localStorage):', requests);
        
        // Transform database data to match component expectations
        const transformedRequests = requests.map(request => ({
          id: request.id,
          plotId: request.plot_id,
          deceasedName: request.deceased_name,
          nextOfKin: request.next_of_kin,
          contactNumber: request.contact_number,
          relationship: request.relationship,
          reason: request.reason,
          alternativeLocation: request.alternative_location,
          specialInstructions: request.special_instructions,
          requestDate: request.request_date,
          status: request.status,
          adminNotes: request.admin_notes,
          exhumationDate: request.exhumation_date,
          exhumationTeam: request.exhumation_team,
          documents: request.documents || []
        }));
        
        setExhumationRequests(transformedRequests);
        setLoading(false);
        
        // Debug: Log all requests and their statuses
        console.log('=== EXHUMATION REQUESTS DEBUG ===');
        console.log('Total requests loaded:', transformedRequests.length);
        transformedRequests.forEach((request, index) => {
          console.log(`${index + 1}. ${request.deceasedName} - Status: ${request.status} - Plot: ${request.plotId}`);
        });
        
        const completedCount = transformedRequests.filter(r => r.status === 'completed').length;
        console.log(`Completed requests: ${completedCount}`);
        
        // Show notification if there are new pending requests
        const pendingCount = transformedRequests.filter(r => r.status === 'pending').length;
        if (pendingCount > 0) {
          setNotification(`You have ${pendingCount} pending exhumation request${pendingCount > 1 ? 's' : ''} to review.`);
          setTimeout(() => setNotification(null), 5000);
        }
      } catch (error) {
        console.error('Error loading exhumation requests:', error);
        setLoading(false);
      }
    };

    loadRequests();
  }, [refreshKey]);

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000); // 10 seconds for more responsive updates

    return () => clearInterval(interval);
  }, []);

  // Function to refresh data
  const refreshData = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 2000);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case 'family_relocation': return 'Family decision to relocate remains';
      case 'cemetery_expansion': return 'Cemetery expansion project';
      case 'legal_requirement': return 'Legal requirement';
      case 'investigation': return 'Investigation purposes';
      case 'medical_examination': return 'Medical examination';
      default: return reason;
    }
  };

  const handleStatusUpdate = async (requestId, newStatus, adminNotes = '', exhumationDate = null, exhumationTeam = '') => {
    try {
      // Update in database
      await DataService.updateExhumationRequestStatus(requestId, newStatus, adminNotes, exhumationDate, exhumationTeam);
      
      // Update local state immediately
      setExhumationRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { 
                ...request, 
                status: newStatus, 
                adminNotes,
                exhumationDate: exhumationDate || request.exhumationDate,
                exhumationTeam: exhumationTeam || request.exhumationTeam
              }
            : request
        )
      );

      // Show success notification
      setNotification(`Exhumation request status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setNotification(null), 3000);

      // Trigger immediate refresh to get latest data from database
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 1000);

      // If approved, handle plot transfer and status updates
      if (newStatus === 'approved') {
        const request = exhumationRequests.find(r => r.id === requestId);
        if (request) {
          try {
            // Get the original plot data
            const originalPlot = await DataService.getPlot(request.plotId);
            
            if (originalPlot) {
              // Extract destination plot from alternative_location
              const destinationPlotId = request.alternativeLocation?.split(' - ')[0]?.toLowerCase();
              
              if (destinationPlotId) {
                // Get destination plot data
                const destinationPlot = await DataService.getPlot(destinationPlotId);
                
                if (destinationPlot && (!destinationPlot.occupant_name || destinationPlot.occupant_name.trim() === '')) {
                  // Transfer deceased person data to new plot
                  const transferData = {
                    occupant_name: originalPlot.occupant_name,
                    age: originalPlot.age,
                    date_of_interment: originalPlot.date_of_interment,
                    cause_of_death: originalPlot.cause_of_death,
                    religion: originalPlot.religion,
                    family_name: originalPlot.family_name,
                    next_of_kin: originalPlot.next_of_kin,
                    contact_number: originalPlot.contact_number,
                    notes: originalPlot.notes,
                    status: 'occupied'
                  };
                  
                  // Update destination plot with transferred data
                  await DataService.updatePlot(destinationPlotId, transferData);
                  
                  // Mark original plot as exhumed
                  await DataService.updatePlot(request.plotId, { 
                    status: 'exhumed',
                    occupant_name: '',
                    age: null,
                    date_of_interment: null,
                    cause_of_death: '',
                    religion: '',
                    family_name: '',
                    next_of_kin: '',
                    contact_number: '',
                    notes: 'Exhumed and relocated'
                  });
                  
                  console.log(`Successfully transferred ${originalPlot.occupant_name} from ${request.plotId} to ${destinationPlotId}`);
                } else {
                  console.warn(`Destination plot ${destinationPlotId} is not available or already occupied`);
                }
              } else {
                // No specific destination plot, just mark as exhumed
                await DataService.updatePlot(request.plotId, { status: 'exhumed' });
              }
            }
          } catch (transferError) {
            console.error('Error during plot transfer:', transferError);
            // Still mark as exhumed even if transfer fails
            await DataService.updatePlot(request.plotId, { status: 'exhumed' });
          }
        }
      }

      // If completed, make the original plot available again (green)
      if (newStatus === 'completed') {
        const request = exhumationRequests.find(r => r.id === requestId);
        if (request) {
          try {
            // Get the original plot data
            const originalPlot = await DataService.getPlot(request.plotId);
            
            if (originalPlot) {
              // Make the plot available again (green) by clearing all data
              await DataService.updatePlot(request.plotId, { 
                status: 'available',
                occupant_name: '',
                age: null,
                date_of_interment: null,
                cause_of_death: '',
                religion: '',
                family_name: '',
                next_of_kin: '',
                contact_number: '',
                notes: 'Available for new burial'
              });
              
              console.log(`Successfully made plot ${request.plotId} available again after exhumation completion`);
              
              // Dispatch custom event to refresh map colors
              console.log('📡 Dispatching exhumationStatusChanged event...');
              const event = new CustomEvent('exhumationStatusChanged', {
                detail: { plotId: request.plotId, status: 'completed' }
              });
              window.dispatchEvent(event);
              console.log('📡 Event dispatched successfully');
            } else {
              console.warn(`Original plot ${request.plotId} not found`);
            }
          } catch (error) {
            console.error('Error making plot available after completion:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating exhumation request:', error);
      alert('Error updating exhumation request. Please try again.');
    }
  };

  const filteredRequests = exhumationRequests.filter(request => 
    filterStatus === 'all' || request.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exhumation requests...</p>
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
            <div className="ml-auto flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <button
                onClick={() => setNotification(null)}
                className="text-green-600 hover:text-green-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🏺 Exhumation Management</h2>
            <p className="text-gray-600 mt-1">Manage exhumation requests and track progress</p>
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
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
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
                {exhumationRequests.filter(r => r.status === 'pending').length}
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
                {exhumationRequests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-times-circle text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {exhumationRequests.filter(r => r.status === 'rejected').length}
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {exhumationRequests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Exhumation Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plot Information
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
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.deceasedName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Next of Kin: {request.nextOfKin}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.contactNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.plotId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getReasonText(request.reason)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                    {request.exhumationDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Scheduled: {new Date(request.exhumationDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'approved', 'Request approved by admin')}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'rejected', 'Request rejected by admin')}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'completed', 'Exhumation completed')}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Mark Complete
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
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Exhumation Request Details</h3>
                  <p className="text-purple-100 mt-1">
                    {selectedRequest.deceasedName} - {selectedRequest.plotId}
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
              {/* Request Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Request Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Request Date:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(selectedRequest.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.toUpperCase()}
                      </span>
                    </div>
                    {selectedRequest.exhumationDate && (
                      <div>
                        <span className="font-medium text-gray-700">Exhumation Date:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(selectedRequest.exhumationDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedRequest.exhumationTeam && (
                      <div>
                        <span className="font-medium text-gray-700">Exhumation Team:</span>
                        <span className="ml-2 text-gray-600">{selectedRequest.exhumationTeam}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Next of Kin:</span>
                      <span className="ml-2 text-gray-600">{selectedRequest.nextOfKin}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Contact Number:</span>
                      <span className="ml-2 text-gray-600">{selectedRequest.contactNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Relationship:</span>
                      <span className="ml-2 text-gray-600 capitalize">{selectedRequest.relationship}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exhumation Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Exhumation Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Reason:</span>
                    <span className="ml-2 text-gray-600">{getReasonText(selectedRequest.reason)}</span>
                  </div>
                  {selectedRequest.alternativeLocation && (
                    <div>
                      <span className="font-medium text-gray-700">Alternative Location:</span>
                      <span className="ml-2 text-gray-600">{selectedRequest.alternativeLocation}</span>
                    </div>
                  )}
                  {selectedRequest.specialInstructions && (
                    <div>
                      <span className="font-medium text-gray-700">Special Instructions:</span>
                      <span className="ml-2 text-gray-600">{selectedRequest.specialInstructions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Supporting Documents</h4>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-gray-700">{doc}</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.adminNotes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Admin Notes</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-700">{selectedRequest.adminNotes}</p>
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

export default ExhumationManagement;
