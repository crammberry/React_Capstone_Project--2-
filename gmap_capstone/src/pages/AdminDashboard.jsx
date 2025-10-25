import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DataService from '../services/DataService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PlotModal } from '../components/Modal';
import HardcodedCemeteryMap from '../components/HardcodedCemeteryMap';
import ExhumationManagement from '../components/ExhumationManagement';
import ReservationManagement from '../components/ReservationManagement';
import UserManagement from '../components/UserManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, userProfile, logout } = useAuth();
  
  // Database state
  const [realisticStats, setRealisticStats] = useState({ total: 0, available: 0, occupied: 0, reserved: 0, exhumed: 0 });
  const [realisticPlots, setRealisticPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlots, setFilteredPlots] = useState([]);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [stats, plots] = await Promise.all([
          DataService.getPlotStats(),
          DataService.getAllPlots()
        ]);
        
        setRealisticStats(stats);
        setRealisticPlots(plots);
        setFilteredPlots(plots);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter plots based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlots(realisticPlots);
    } else {
      const filtered = realisticPlots.filter(plot => 
        plot.occupant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.plot_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.plot_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlots(filtered);
    }
  }, [searchTerm, realisticPlots]);

  // Handle plot creation
  const handleCreatePlot = async (plotData) => {
    try {
      const newPlot = await DataService.createPlot(plotData);
      if (newPlot) {
        setRealisticPlots(prev => [...prev, newPlot]);
        // Refresh stats
        const stats = await DataService.getPlotStats();
        setRealisticStats(stats);
      }
    } catch (error) {
      console.error('Error creating plot:', error);
    }
  };

  // Handle plot update
  const handleUpdatePlot = async (plotId, updateData) => {
    try {
      const updatedPlot = await DataService.updatePlot(plotId, updateData);
      if (updatedPlot) {
        setRealisticPlots(prev => prev.map(plot => 
          plot.id === plotId ? updatedPlot : plot
        ));
        // Refresh stats
        const stats = await DataService.getPlotStats();
        setRealisticStats(stats);
      }
    } catch (error) {
      console.error('Error updating plot:', error);
    }
  };

  // Handle plot deletion
  const handleDeletePlot = async (plotId) => {
    try {
      const success = await DataService.deletePlot(plotId);
      if (success) {
        setRealisticPlots(prev => prev.filter(plot => plot.id !== plotId));
        // Refresh stats
        const stats = await DataService.getPlotStats();
        setRealisticStats(stats);
      }
    } catch (error) {
      console.error('Error deleting plot:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-3">Admin Dashboard</h1>
              <p className="text-blue-100 text-lg">Manage cemetery plots, subscriptions, and exhumations</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('plots')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plots'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Plots
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cemetery Map
            </button>
            <button
              onClick={() => setActiveTab('exhumation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exhumation'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏺 Exhumation Management
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏷️ Plot Reservations
            </button>
            {/* SUPERADMIN ONLY: User Management Tab */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⭐ User Management
              </button>
            )}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-chart-pie text-blue-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Plots</dt>
                        <dd className="text-lg font-medium text-gray-900">{loading ? '...' : realisticStats.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-user-times text-red-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Occupied</dt>
                        <dd className="text-lg font-medium text-gray-900">{loading ? '...' : realisticStats.occupied}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                        <dd className="text-lg font-medium text-gray-900">{loading ? '...' : realisticStats.available}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-clock text-yellow-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Reserved</dt>
                        <dd className="text-lg font-medium text-gray-900">{loading ? '...' : realisticStats.reserved}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-info-circle text-stone-600 text-xl"></i>
                <h3 className="text-lg font-semibold text-stone-800 ml-2">Realistic Cemetery System</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-stone-800 mb-1">Mausoleum System</h4>
                  <p className="text-stone-600">70% have Level 2, 30% only Level 1</p>
                </div>
                <div>
                  <h4 className="font-semibold text-stone-800 mb-1">Apartment System</h4>
                  <p className="text-stone-600">Higher chance of Level 3 availability</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plots Management Tab */}
        {activeTab === 'plots' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Cemetery Plots</h3>
              <button
                onClick={() => setShowPlotModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add New Plot
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search plots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Plots Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {loading ? (
                  <li className="px-6 py-4 text-center text-gray-500">Loading plots...</li>
                ) : filteredPlots.length === 0 ? (
                  <li className="px-6 py-4 text-center text-gray-500">No plots found</li>
                ) : (
                  filteredPlots.map((plot) => (
                    <li key={plot.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {plot.occupant_name || 'Available'}
                            </p>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              plot.status === 'occupied' ? 'bg-red-100 text-red-800' :
                              plot.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                              plot.status === 'exhumed' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {plot.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {plot.section} - Level {plot.level} - Plot {plot.plot_number}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdatePlot(plot.id, { status: 'occupied' })}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlot(plot.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cemetery Map</h3>
          <HardcodedCemeteryMap />
        </div>
        )}

        {/* Exhumation Management Tab */}
        {activeTab === 'exhumation' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ExhumationManagement />
          </div>
        )}

        {/* Plot Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ReservationManagement />
          </div>
        )}

        {/* User Management Tab - SUPERADMIN ONLY */}
        {activeTab === 'users' && isSuperAdmin && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <UserManagement />
          </div>
        )}
      </div>

      {/* Plot Modal */}
      {showPlotModal && (
        <PlotModal
          isOpen={showPlotModal}
          onClose={() => setShowPlotModal(false)}
          onSubmit={handleCreatePlot}
        />
      )}
        </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
