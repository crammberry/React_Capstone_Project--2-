import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HierarchicalCemeteryMap from '../components/HierarchicalCemeteryMap';
import CemeteryDirectory from '../components/CemeteryDirectory';
import DataService from '../services/DataService';

const MapPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);

  // Get all plot data from database
  const getAllCemeteryData = async () => {
    try {
      const plots = await DataService.getAllPlots();
      return plots;
    } catch (error) {
      console.error('Error loading cemetery data:', error);
      return [];
    }
  };

  // Load cemetery data
  useEffect(() => {
    const loadData = async () => {
      try {
        const allPlots = await getAllCemeteryData();
        setDataLoaded(true);
        
        // If there's a search term from URL, perform search
        if (searchTerm) {
          performSearch(searchTerm, allPlots);
        }
      } catch (error) {
        console.error('Error loading cemetery data:', error);
        setDataLoaded(true);
      }
    };

    loadData();
  }, []);

  // Enhanced search function using database
  const performSearch = async (term, allPlots = null) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await DataService.searchPlots(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (dataLoaded) {
      performSearch(searchTerm);
    }
  };

  const handlePlotClick = (plot) => {
    // Show directions to the plot
    if (window.showDirectionsToPlot) {
      window.showDirectionsToPlot(plot.plot_id, plot);
    } else {
      // Fallback: navigate to the map with the specific plot highlighted
      navigate(`/map?highlight=${plot.plot_id}`);
    }
  };

  const handleNavigateToSection = (sectionId) => {
    // Navigate to the specific section on the map
    navigate(`/map?section=${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header 
        isAdmin={isAdmin}
        onLogout={logout}
      />

      {/* Hero Section with Enhanced Search */}
      <section className="relative py-8 sm:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/10 to-teal-400/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-200/20 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-2 sm:px-4 lg:px-8">
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-slate-800 mb-3 sm:mb-4 md:mb-6 font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            Find Your Loved Ones
          </h3>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 lg:mb-12 px-1 sm:px-2 md:px-4 font-light">
            Search for your family members and friends who rest in our memorial park
          </p>
          
          {!dataLoaded && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="loading-spinner w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading cemetery data...
              </div>
            </div>
          )}
          
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 justify-center mb-4 sm:mb-6 w-full max-w-4xl mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter name, plot ID, or section..."
                className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl text-sm sm:text-base md:text-lg focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i className="fas fa-search text-sm sm:text-base"></i>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSearching || !dataLoaded}
              className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl flex items-center gap-2 sm:gap-3 justify-center min-h-[44px] sm:min-h-[48px] md:min-h-[56px] w-full"
            >
              {isSearching ? (
                <div className="loading-spinner w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <i className="fas fa-search text-base sm:text-lg md:text-xl"></i>
              )}
              Search
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </form>
          
          {/* Directory Button */}
          <div className="flex justify-center mt-3 sm:mt-4 w-full">
            <button
              onClick={() => setShowDirectory(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 md:px-8 py-3 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl flex items-center gap-2 sm:gap-3 w-full max-w-md"
            >
              <i className="fas fa-map-marked-alt text-base sm:text-lg md:text-xl"></i>
              Cemetery Directory
            </button>
          </div>
          
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 px-1 sm:px-2 md:px-4 font-medium mt-2 sm:mt-3 md:mt-4 text-center">
            Search by name, plot ID, section, or level
          </p>
        </div>
      </section>

      {/* Search Results */}
      {searchTerm && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <h3 className="text-2xl sm:text-3xl text-slate-800 font-bold mb-8 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
              Search Results for "{searchTerm}"
            </h3>
            
            {searchResults.length > 0 ? (
            <div className="space-y-6">
                <p className="text-gray-600 mb-6">Found {searchResults.length} result(s)</p>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 sm:p-8 cursor-pointer hover:border-blue-300 hover:shadow-2xl hover:transform hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                    onClick={() => handlePlotClick(result)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl text-slate-700 font-semibold mb-2">
                          {result.occupant_name || 'Available Plot'}
                      </h4>
                      <div className="space-y-1 text-sm sm:text-base">
                        <p className="text-gray-600">
                            <strong>Plot ID:</strong> {result.plot_id}
                        </p>
                        <p className="text-gray-600">
                          <strong>Section:</strong> {result.section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-gray-600">
                            <strong>Level:</strong> {result.level}
                        </p>
                          <p className="text-gray-600">
                            <strong>Tomb:</strong> {result.plot_number}
                          </p>
                          {result.date_of_interment && (
                            <p className="text-gray-600">
                              <strong>Date of Interment:</strong> {result.date_of_interment}
                            </p>
                          )}
                          {result.age && (
                            <p className="text-gray-600">
                              <strong>Age at Death:</strong> {result.age} years old
                            </p>
                          )}
                          {result.cause_of_death && (
                            <p className="text-gray-600">
                              <strong>Cause of Death:</strong> {result.cause_of_death}
                            </p>
                          )}
                          {result.religion && (
                            <p className="text-gray-600">
                              <strong>Religion:</strong> {result.religion}
                            </p>
                          )}
                        {result.notes && (
                          <p className="text-gray-600">
                            <strong>Notes:</strong> {result.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-3">
                      <span
                          className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                          result.status === 'occupied'
                            ? 'bg-red-100 text-red-800'
                            : result.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : result.status === 'reserved'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                            {result.status.toUpperCase()}
                      </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (window.showDirectionsToPlot) {
                              window.showDirectionsToPlot(result.plot_id, result);
                            } else {
                              // Fallback: navigate to the map
                              navigate(`/map?highlight=${result.plot_id}`);
                            }
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center space-x-1"
                        >
                          <span>🗺️</span>
                          <span>Directions</span>
                        </button>
                      </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-search text-3xl text-gray-400"></i>
                </div>
                <h4 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h4>
                <p className="text-gray-500 mb-6">
                  We couldn't find any plots matching "{searchTerm}". Try searching with a different term.
                </p>
                <div className="text-sm text-gray-400">
                  <p>Try searching by:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Full name or part of the name</li>
                    <li>• Plot ID (e.g., "lb-1-level1-A")</li>
                    <li>• Section name (e.g., "LB-1", "Apartment-2")</li>
                    <li>• Level number (e.g., "1", "2", "3")</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cemetery Map */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h3 className="text-3xl sm:text-4xl text-slate-800 font-bold mb-8 text-center bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
            Cemetery Map
              </h3>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Explore our memorial park and find the resting places of your loved ones. 
            Click on any section to view available plots and levels.
          </p>
          
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <HierarchicalCemeteryMap />
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Cemetery Directory Modal */}
      {showDirectory && (
        <CemeteryDirectory
          onClose={() => setShowDirectory(false)}
          onNavigateToSection={handleNavigateToSection}
        />
      )}
    </div>
  );
};

export default MapPage;