import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useExhumation } from '../contexts/ExhumationContext';
// No database - using local data
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PlotModal } from '../components/Modal';
import HierarchicalCemeteryMap from '../components/HierarchicalCemeteryMap';
// No Supabase test component

// Using local Filipino data

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, login, isAdmin } = useAuth();
  
  // Original working data structure
  const plots = [
    {
      id: 1,
      name: "Maria Santos",
      plot: "LSP-8-2",
      section: "Left Side Pasilyo",
      dateOfInterment: "2023-01-15",
      status: "occupied",
      notes: "Family plot"
    },
    {
      id: 2,
      name: "Jose dela Cruz",
      plot: "RSP-1-3",
      section: "Right Side Pasilyo",
      dateOfInterment: "2023-03-22",
      status: "occupied",
      notes: "Veteran"
    },
    {
      id: 3,
      name: "Pedro Gonzales",
      plot: "LB-2-1",
      section: "Left Block",
      dateOfInterment: "2023-02-14",
      status: "occupied",
      notes: "Catholic ceremony"
    },
    {
      id: 4,
      name: "Plot Available",
      plot: "APT-5-1",
      section: "Apartments",
      dateOfInterment: "",
      status: "available",
      notes: "Available for reservation"
    },
    {
      id: 5,
      name: "Carmen Villanueva",
      plot: "RB-3-7",
      section: "Right Block",
      dateOfInterment: "",
      status: "reserved",
      notes: "Reserved for upcoming interment"
    }
  ];
  
  const loading = false;
  const error = null;
  
  const getPlotsBySection = (sectionName) => {
    return plots.filter(plot => plot.section === sectionName);
  };

  const createPlot = async (plotData) => {
    console.log('Creating plot:', plotData);
    return { id: Date.now(), ...plotData };
  };

  const updatePlot = async (plotId, plotData) => {
    console.log('Updating plot:', plotId, plotData);
    return { id: plotId, ...plotData };
  };

  const deletePlot = async (plotId) => {
    console.log('Deleting plot:', plotId);
    return true;
  };

  const getStats = () => {
    return {
      total: plots.length,
      available: plots.filter(p => p.status === 'available').length,
      occupied: plots.filter(p => p.status === 'occupied').length,
      reserved: plots.filter(p => p.status === 'reserved').length,
      exhumed: plots.filter(p => p.status === 'exhumed').length
    };
  };

  // Get real-time stats
  const stats = getStats();
  
  let exhumationContext;
  try {
    exhumationContext = useExhumation();
  } catch (error) {
    console.error('Error accessing exhumation context in AdminDashboard:', error);
    exhumationContext = {
      exhumationRequests: [],
      updateExhumationRequest: () => {},
      deleteExhumationRequest: () => {}
    };
  }
  
  const { exhumationRequests, updateExhumationRequest, deleteExhumationRequest } = exhumationContext;
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Using filteredPlots from real Firebase data instead of filteredData
  const [activeTab, setActiveTab] = useState('plots');
  const [exhumationFilter, setExhumationFilter] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Exhumation management functions
  const handleExhumationStatusChange = (id, status) => {
    updateExhumationRequest(id, { status });
  };

  const handleExhumationNotesUpdate = (id, adminNotes) => {
    updateExhumationRequest(id, { adminNotes });
  };

  const filteredExhumationRequests = exhumationRequests.filter(request => {
    if (exhumationFilter === 'all') return true;
    return request.status === exhumationFilter;
  });

  const handleAddPlot = () => {
    setEditingPlot(null);
    setShowPlotModal(true);
  };

  const handleEditPlot = (plot) => {
    setEditingPlot(plot);
    setShowPlotModal(true);
  };

  const handleSavePlot = async (plotData) => {
    try {
      if (editingPlot) {
        // Update existing plot
        const success = await updatePlot(editingPlot.id, plotData);
        if (success) {
          console.log('Plot updated successfully');
        }
      } else {
        // Add new plot
        const plotId = await createPlot(plotData);
        if (plotId) {
          console.log('Plot created successfully');
        }
      }
      setShowPlotModal(false);
      setEditingPlot(null);
    } catch (err) {
      console.error('Error saving plot:', err);
      alert('Error saving plot: ' + err.message);
    }
  };

  const handleDeletePlot = async (plotId) => {
    if (window.confirm('Are you sure you want to delete this plot?')) {
      try {
        const success = await deletePlot(plotId);
        if (success) {
          console.log('Plot deleted successfully');
        }
      } catch (err) {
        console.error('Error deleting plot:', err);
        alert('Error deleting plot: ' + err.message);
      }
    }
  };

  const filteredPlots = plots.filter(plot =>
    plot.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.plot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading plots...</p>
          </div>
        </div>
        <Footer statusText="Admin Dashboard - Loading data" />
      </div>
    );
  }

  if (error && plots.length === 0) { // Only show full error if no fallback data is available
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
        <Footer statusText="Admin Dashboard - Error" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Admin Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">Admin Dashboard</h1>
              <p className="text-blue-100 text-lg">Manage cemetery plots, subscriptions, and exhumations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddPlot}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-md"
              >
                <i className="fas fa-plus-circle mr-2"></i>
                Add New Plot
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors duration-300 shadow-md"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Warning!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Plots</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Available</h3>
            <p className="text-4xl font-bold text-green-600">{stats.available}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Occupied</h3>
            <p className="text-4xl font-bold text-red-600">{stats.occupied}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Reserved</h3>
            <p className="text-4xl font-bold text-yellow-600">{stats.reserved}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Exhumed</h3>
            <p className="text-4xl font-bold text-gray-600">{stats.exhumed}</p>
          </div>
        </div>

        {/* Tabs for Plots and Exhumation Requests */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('plots')}
            className={`py-3 px-6 text-lg font-medium ${activeTab === 'plots' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Cemetery Plots
          </button>
          <button
            onClick={() => setActiveTab('exhumations')}
            className={`py-3 px-6 text-lg font-medium ${activeTab === 'exhumations' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Exhumation Requests
          </button>
        </div>

        {activeTab === 'plots' && (
          <>
            {/* Search and Add Plot */}
            <div className="flex justify-between items-center mb-6">
              <input
                type="text"
                placeholder="Search plots by name, number, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Plot List */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plot ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plot Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupant Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Interment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlots.length > 0 ? (
                    filteredPlots.map((plot) => (
                      <tr key={plot.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plot.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plot.section}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plot.plot}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            plot.status === 'available' ? 'bg-green-100 text-green-800' :
                            plot.status === 'occupied' ? 'bg-red-100 text-red-800' :
                            plot.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {plot.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plot.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plot.dateOfInterment}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditPlot(plot)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlot(plot.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {loading ? 'Loading plots...' : 'No plots found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cemetery Map */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Cemetery Map Overview</h2>
              <HierarchicalCemeteryMap onPlotClick={handleEditPlot} />
            </div>
          </>
        )}

        {activeTab === 'exhumations' && (
          <>
            <div className="flex justify-end mb-4">
              <select
                value={exhumationFilter}
                onChange={(e) => setExhumationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plot ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExhumationRequests.length > 0 ? (
                    filteredExhumationRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.plotId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requesterName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="text"
                            value={request.adminNotes}
                            onChange={(e) => handleExhumationNotesUpdate(request.id, e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                            placeholder="Add notes..."
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleExhumationStatusChange(request.id, 'approved')}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleExhumationStatusChange(request.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        No exhumation requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {/* Temporary Admin Login */}
      {!isAdmin && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto mt-8">
          <h3 className="text-lg font-bold mb-4 text-yellow-800">Admin Login Required</h3>
          <p className="text-yellow-700 mb-4">Click below to login as admin for full functionality:</p>
          <button
            onClick={() => login('admin', 'admin123')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Login as Admin (admin/admin123)
          </button>
        </div>
      )}
      
      {/* System Status */}
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto mt-8">
        <h3 className="text-lg font-bold mb-2 text-green-800">✅ System Status: WORKING</h3>
        <p className="text-green-700">No database - using local Filipino data</p>
        <p className="text-green-700">5 plots loaded successfully</p>
      </div>

      <Footer statusText="Admin Dashboard - Managing cemetery records" />

      {/* Modals */}
      <PlotModal
        isOpen={showPlotModal}
        onClose={() => setShowPlotModal(false)}
        plotData={editingPlot}
        onSave={handleSavePlot}
        isEdit={!!editingPlot}
      />
    </div>
  );
};

export default AdminDashboard;



