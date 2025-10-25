import React, { useState, useEffect, useRef } from 'react';
import DataService from '../services/DataService';
import { useAuth } from '../contexts/AuthContext';
import ExhumationRequestModal from './ExhumationRequestModal';
import PlotDetailsModal from './PlotDetailsModal';
import ExhumationRequestForm from './ExhumationRequestForm';
import PlotReservationForm from './PlotReservationForm';
import './HardcodedCemeteryMap.css';

const HardcodedCemeteryMap = () => {
  const { isAdmin } = useAuth();
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [availableLevels, setAvailableLevels] = useState([1, 2, 3]);
  const [isDefaultView, setIsDefaultView] = useState(true);
  const [focusedLevel, setFocusedLevel] = useState(null);
  const [selectedTomb, setSelectedTomb] = useState(null);
  const [showOfficeTooltip, setShowOfficeTooltip] = useState(false);
  const [hoveredPlot, setHoveredPlot] = useState(null);

  // Ensure map is centered on initial load
  useEffect(() => {
    // Reset to default centered position
    setPanX(0);
    setPanY(0);
    setZoomLevel(1);
    setRotationX(60);
    setRotationY(-15);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDirections, setShowDirections] = useState(false);
  const [directions, setDirections] = useState([]);
  const [targetPlot, setTargetPlot] = useState(null);
  const [showExhumationModal, setShowExhumationModal] = useState(false);
  const [exhumationPlotData, setExhumationPlotData] = useState(null);
  
  // New state for exhumation/reservation modals
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [showExhumationForm, setShowExhumationForm] = useState(false);
  const [exhumationType, setExhumationType] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Zoom and rotation controls
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const mapContainerRef = useRef(null);
  const [rotationX, setRotationX] = useState(45);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Cemetery sections data - hardcoded structure
  const cemeterySections = [
    {
      id: 'left-block',
      name: 'Left Block',
      description: 'Traditional burial plots',
      levels: [1, 2],
      color: '#4a90e2',
      icon: '🏛️',
      plots: [
        { id: 'lb-1a', name: 'LB-1A', level: 1, status: 'available' },
        { id: 'lb-1b', name: 'LB-1B', level: 1, status: 'available' },
        { id: 'lb-1c', name: 'LB-1C', level: 1, status: 'occupied' },
        { id: 'lb-2a', name: 'LB-2A', level: 1, status: 'available' },
        { id: 'lb-2b', name: 'LB-2B', level: 1, status: 'reserved' },
        { id: 'lb-2c', name: 'LB-2C', level: 1, status: 'available' },
        { id: 'lb-3a', name: 'LB-3A', level: 2, status: 'available' },
        { id: 'lb-3b', name: 'LB-3B', level: 2, status: 'occupied' },
        { id: 'lb-4a', name: 'LB-4A', level: 2, status: 'available' },
        { id: 'lb-4b', name: 'LB-4B', level: 2, status: 'available' }
      ]
    },
    {
      id: 'right-block',
      name: 'Right Block',
      description: 'Traditional burial plots',
      levels: [1, 2],
      color: '#7b68ee',
      icon: '🏛️',
      plots: [
        { id: 'rb-1a', name: 'RB-1A', level: 1, status: 'available' },
        { id: 'rb-1b', name: 'RB-1B', level: 1, status: 'occupied' },
        { id: 'rb-1c', name: 'RB-1C', level: 1, status: 'available' },
        { id: 'rb-2a', name: 'RB-2A', level: 1, status: 'reserved' },
        { id: 'rb-2b', name: 'RB-2B', level: 1, status: 'available' },
        { id: 'rb-3a', name: 'RB-3A', level: 2, status: 'occupied' },
        { id: 'rb-3b', name: 'RB-3B', level: 2, status: 'available' },
        { id: 'rb-4a', name: 'RB-4A', level: 2, status: 'available' }
      ]
    },
    {
      id: 'apartment-section',
      name: 'Apartment Section',
      description: 'Multi-level apartment-style burials',
      levels: [1, 2, 3],
      color: '#ff6b6b',
      icon: '🏢',
      plots: [
        { id: 'apt-1a', name: 'APT-1A', level: 1, status: 'available' },
        { id: 'apt-1b', name: 'APT-1B', level: 1, status: 'occupied' },
        { id: 'apt-1c', name: 'APT-1C', level: 1, status: 'available' },
        { id: 'apt-2a', name: 'APT-2A', level: 2, status: 'reserved' },
        { id: 'apt-2b', name: 'APT-2B', level: 2, status: 'available' },
        { id: 'apt-3a', name: 'APT-3A', level: 3, status: 'occupied' },
        { id: 'apt-3b', name: 'APT-3B', level: 3, status: 'available' }
      ]
    },
    {
      id: 'veterans-section',
      name: 'Veterans Section',
      description: 'Honor our heroes',
      levels: [1],
      color: '#ffa500',
      icon: '🎖️',
      plots: [
        { id: 'vet-1a', name: 'VET-2A', level: 1, status: 'available' },
        { id: 'vet-1b', name: 'VET-1B', level: 1, status: 'occupied' },
        { id: 'vet-2a', name: 'VET-2A', level: 1, status: 'available' },
        { id: 'vet-2b', name: 'VET-1B', level: 1, status: 'reserved' }
      ]
    },
    {
      id: 'eternal-tomb',
      name: 'Eternal Tomb',
      description: 'Premium family mausoleums',
      levels: [1, 2],
      color: '#9b59b6',
      icon: '🏛️',
      plots: [
        { id: 'et-1a', name: 'ET-1A', level: 1, status: 'available' },
        { id: 'et-1b', name: 'ET-1B', level: 1, status: 'occupied' },
        { id: 'et-2a', name: 'ET-2A', level: 2, status: 'available' },
        { id: 'et-2b', name: 'ET-2B', level: 2, status: 'reserved' }
      ]
    }
  ];

  // Function to load plots data from Supabase
  const loadPlots = async () => {
    try {
      setLoading(true);
      const allPlots = await DataService.getAllPlots();
      setPlots(allPlots);
      console.log('✅ Loaded plots from Supabase:', allPlots.length);
    } catch (error) {
      console.error('Error loading plots:', error);
      setError('Failed to load plot data');
    } finally {
      setLoading(false);
    }
  };

  // Load plots on mount and refresh periodically
  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ HardcodedCemeteryMap timeout reached, forcing map to load');
      setLoading(false);
    }, 3000); // 3 second timeout
    
    loadPlots();
    
    // Auto-refresh plots every 10 seconds to catch admin updates
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing plot data...');
      loadPlots();
    }, 10000); // Refresh every 10 seconds
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(refreshInterval);
    };
  }, []);

  // Track mouse position to determine if zoom should be active
  const [isMouseOverMap, setIsMouseOverMap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Pan functionality for map exploration
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Controls visibility
  const [showControls, setShowControls] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getAvailableLevels = (sectionId) => {
    const section = cemeterySections.find(s => s.id === sectionId);
    return section ? section.levels : [1];
  };

  const getLevelDescription = (level) => {
    if (level === 1) return "Ground Level - Main Burial Area";
    if (level === 2) return "Second Level - Elevated Burials";
    if (level === 3) return "Third Level - Top Tier Burials";
    return `Level ${level}`;
  };

  const handleLevelClick = (level) => {
    console.log('Level clicked:', level);
    
    // Update state immediately to ensure proper visibility
    setCurrentLevel(level);
    setFocusedLevel(level);
    setIsDefaultView(false);
    setShowLevelSelector(false);
    
    // First, animate out other levels
    const allLevels = document.querySelectorAll('.cemetery-level');
    allLevels.forEach((levelEl, index) => {
      const levelNumber = index + 1;
      if (levelNumber !== level) {
        levelEl.style.transition = 'all 0.5s ease';
        levelEl.style.opacity = '0';
        levelEl.style.transform = levelEl.style.transform.replace(/translateZ\([^)]*\)/, 'translateZ(0px)') + ' scale(0.8)';
      }
    });
    
    // Animate in the selected level
    setTimeout(() => {
      const selectedLevel = allLevels[level - 1];
      if (selectedLevel) {
        selectedLevel.style.transition = 'all 0.5s ease';
        selectedLevel.style.opacity = '1';
        selectedLevel.style.transform = selectedLevel.style.transform.replace(/scale\([^)]*\)/, 'scale(1)');
      }
    }, 100);
  };

  const handleBackToDefaultView = () => {
    // Reset all state to default values
    setIsDefaultView(true);
    setFocusedLevel(null);
    setCurrentLevel(1);
    
    // Reset pan and zoom to default values
    setPanX(0);
    setPanY(0);
    setZoomLevel(0.5);
    setRotationX(45);
    setRotationY(0);
    
    // Animate all levels back to default view
    const allLevels = document.querySelectorAll('.cemetery-level');
    allLevels.forEach((levelEl, index) => {
      const levelNumber = index + 1;
      levelEl.style.transition = 'all 0.6s ease';
      levelEl.style.opacity = '1';
      
      // Restore original transform based on level
      if (levelNumber === 1) {
        levelEl.style.transform = 'translateZ(0px) scale(1)';
     } else if (levelNumber === 2) {
        levelEl.style.transform = 'translateZ(100px) scale(1)';
      } else if (levelNumber === 3) {
        levelEl.style.transform = 'translateZ(200px) scale(1)';
      }
    });
  };
 
  const handleSectionClick = (sectionId) => {
    console.log('Section clicked:', sectionId);
    setSelectedSection(sectionId);
    setCurrentView('level-selector');
    setShowLevelSelector(true);
  };

  const handleLevelSelection = (level) => {
    setCurrentLevel(level);
    setCurrentView('plot-grid');
  };

  const handleBackToOverview = () => {
    setSelectedSection(null);
    setCurrentView('overview');
    setShowLevelSelector(false);
    setAvailableLevels([]);
  };

  const handleBackToLevelSelector = () => {
    setCurrentView('level-selector');
  };







  // Zoom and rotation handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.3));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setRotationX(60);
    setRotationY(-15);
    setPanX(0);
    setPanY(0);
  };

  // Directional rotation handlers
  const handleRotateUp = () => {
    setRotationX(prev => Math.max(10, prev - 15));
  };

  const handleRotateDown = () => {
    setRotationX(prev => Math.min(90, prev + 15));
  };

  const handleRotateLeft = () => {
    setRotationY(prev => prev - 15);
  };

  const handleRotateRight = () => {
    setRotationY(prev => prev + 15);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsPanning(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Pan the map for exploration
    setPanX(e.clientX - panStart.x);
    setPanY(e.clientY - panStart.y);
    
    // Rotation (optional - can be disabled if you only want panning)
    // setRotationY(prev => prev + deltaX * 0.5);
    // setRotationX(prev => Math.max(10, Math.min(90, prev - deltaY * 0.5)));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    if (isMouseOverMap) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.3, Math.min(3, prev + delta)));
    }
  };

  const handleMouseEnter = () => {
    setIsMouseOverMap(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOverMap(false);
    setIsDragging(false);
    setIsPanning(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    // Auto-close sidebar when controls open, auto-open when controls close
    if (!showControls) {
      setSidebarCollapsed(true); // Close sidebar when opening controls
    } else {
      setSidebarCollapsed(false); // Open sidebar when closing controls
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Improved wheel handler with better event isolation
  const handleWheelImproved = (e) => {
    // Only handle wheel events when mouse is over the map
    if (isMouseOverMap) {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.3, Math.min(3, prev + delta)));
    }
  };

  // Add non-passive wheel event listener to fix preventDefault error
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;

    const handleWheel = (e) => {
      if (isMouseOverMap) {
        e.preventDefault();
        e.stopPropagation();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.max(0.3, Math.min(3, prev + delta)));
      }
    };

    // Add event listener with passive: false
    mapContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      mapContainer.removeEventListener('wheel', handleWheel);
    };
  }, [isMouseOverMap]);

  const handleExhumationRequest = (deceasedData) => {
    const plotData = {
      occupant_name: deceasedData.name,
      plot_id: selectedTomb?.plotId,
      section: selectedTomb?.section,
      level: selectedTomb?.level,
      plot_number: selectedTomb?.tombNumber
    };
    
    setShowPlotModal(false);
    setSelectedTomb(null);
    
    setTimeout(() => {
      setExhumationPlotData(plotData);
      setShowExhumationModal(true);
    }, 100);
  };

  const handleExhumationSubmit = async (exhumationData) => {
    try {
      alert('Exhumation request submitted successfully! You will be contacted within 2-3 business days.');
      setShowExhumationModal(false);
      setExhumationPlotData(null);
      
      setCurrentView('overview');
      setSelectedSection(null);
    } catch (error) {
      console.error('Error submitting exhumation request:', error);
      alert('Error submitting exhumation request. Please try again.');
    }
  };

  const handleDeletePlot = async () => {
    if (!isAdmin) {
      alert('You must be logged in as an admin to delete plot data.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete all data for this plot? This action cannot be undone.')) {
      return;
    }
    
    try {
      const plotId = selectedTomb.plotId;
      
      const clearedData = {
        occupant_name: '',
        age: null,
        cause_of_death: '',
        religion: '',
        family_name: '',
        next_of_kin: '',
        contact_number: '',
        date_of_interment: null,
        status: 'available',
        notes: ''
      };
      
      await DataService.updatePlot(plotId, clearedData);
      
      setSelectedTomb({
        ...selectedTomb,
        deceasedData: clearedData
      });
      
      setIsEditing(false);
      alert('Plot data deleted successfully!');
    } catch (error) {
      console.error('Error deleting plot data:', error);
      alert('Error deleting plot data. Please try again.');
    }
  };

  const getCemeteryTombs = (level) => {
    if (!selectedSection) return [];
    
    const section = cemeterySections.find(s => s.id === selectedSection);
    if (!section) return [];
    
    // Filter plots by level
    const levelPlots = section.plots.filter(plot => plot.level === level);
    
    return levelPlots.map((plot, index) => ({
      id: `tomb-${level}-${index + 1}`,
      name: `Tomb ${level}-${plot.id.split('-').pop().toUpperCase()}`,
      position: { x: 20 + (index * 80), y: 100 },
      level: level,
      column: index + 1,
      plotId: plot.id,
      status: plot.status
    }));
  };

  const getPlotStatusColor = (plotId) => {
    // Get plot data from Supabase
    const plot = plots.find(p => p.plot_id === plotId);
    if (!plot) return '#16a34a'; // Default to green if no data
    
    switch (plot.status) {
      case 'occupied': return '#dc2626'; // Red
      case 'available': return '#16a34a'; // Green
      case 'reserved': return '#d97706'; // Orange
      case 'exhumed': return '#6b7280'; // Gray
      default: return '#16a34a'; // Default to green
    }
  };

  const getPlotStatus = (plotId) => {
    const plot = plots.find(p => p.plot_id === plotId);
    return plot ? plot.status : 'available';
  };

  const handlePlotClick = async (plotId) => {
    try {
      console.log('Plot clicked:', plotId);
      
      // Get plot data from Supabase
      const plot = await DataService.getPlot(plotId);
      
      // Parse plot ID to extract section, level, and plot number
      // Format: SECTION-LEVEL-PLOTNUMBER (e.g., "RB-L3-L1")
      const plotParts = plotId.split('-');
      const section = plotParts[0] || 'Unknown';
      const level = plotParts[1] ? plotParts[1].replace('L', '') : '1';
      const plotNumber = plotParts[2] || '';
      
      if (plot) {
        const deceasedData = {
          plot_id: plotId,
          section: section,
          level: level,
          plot_number: plotNumber,
          name: plot.occupant_name || 'Available',
          age: plot.age || null,
          causeOfDeath: plot.cause_of_death || null,
          religion: plot.religion || null,
          familyName: plot.family_name || null,
          nextOfKin: plot.next_of_kin || null,
          contactNumber: plot.contact_number || null,
          dateOfInterment: plot.date_of_interment || null,
          status: plot.status || 'available',
          plotLocation: plotId,
          tombId: plotId,
          notes: plot.notes || `Plot ${plotId}`
        };
        
        setSelectedTomb({ 
          id: plotId, 
          plotId: plotId, 
          deceasedData 
        });
        setShowPlotModal(true);
      } else {
        // If no plot found in database, show as available plot
        console.log(`ℹ️ Plot ${plotId} not found in database - showing as available`);
        
        const deceasedData = {
          plot_id: plotId,
          section: section,
          level: level,
          plot_number: plotNumber,
          name: 'Available',
          age: null,
          causeOfDeath: null,
          religion: null,
          familyName: null,
          nextOfKin: null,
          contactNumber: null,
          dateOfInterment: null,
          status: 'available',
          plotLocation: plotId,
          tombId: plotId,
          notes: `Plot ${plotId} - This plot is not yet registered in the database. Contact administration for more information.`
        };
        
        setSelectedTomb({ 
          id: plotId, 
          plotId: plotId, 
          deceasedData 
        });
        setShowPlotModal(true);
      }
    } catch (error) {
      console.error('❌ Error loading plot data:', error);
      // Show user-friendly error message
      alert(`Unable to load plot information for ${plotId}. Please try again or contact support.`);
      // Parse plot ID for fallback
      const plotParts = plotId.split('-');
      const section = plotParts[0] || 'Unknown';
      const level = plotParts[1] ? plotParts[1].replace('L', '') : '1';
      const plotNumber = plotParts[2] || '';
      
      // Fallback to available plot
      const deceasedData = {
        plot_id: plotId,
        section: section,
        level: level,
        plot_number: plotNumber,
        name: 'Available',
        age: null,
        causeOfDeath: null,
        religion: null,
        familyName: null,
        nextOfKin: null,
        contactNumber: null,
        dateOfInterment: null,
        status: 'available',
        plotLocation: plotId,
        tombId: plotId,
        notes: `Plot ${plotId}`
      };
      
      setSelectedTomb({ 
        id: plotId, 
        plotId: plotId, 
        deceasedData 
      });
      setShowPlotModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cemetery map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">Error loading map</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cemetery-map-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="cemetery-header">
        <div className="header-title">
          <span className="header-icon">🏛️</span>
          Interactive Cemetery Map
        </div>
        
        {/* Default View Button - Always Visible */}
        <button 
          className="default-view-button" 
          onClick={handleBackToDefaultView}
          title="Default View - Show All Levels"
        >
          <i className="fas fa-layer-group"></i>
          Default View
        </button>
      </div>

      {/* Zoom and Rotation Controls */}
      {showControls && (
      <div className="map-controls">
        {/* Close Controls Button */}
        <button className="close-controls-button" onClick={toggleControls} title="Close Controls">
          <i className="fas fa-times"></i>
        </button>
        
        <div className="controls-section">
          <h3 className="controls-title">🔍 Zoom Controls</h3>
          <div className="zoom-controls">
            <button className="control-button" onClick={handleZoomIn} title="Zoom In">
              <i className="fas fa-plus"></i>
            </button>
            <button className="control-button" onClick={handleZoomOut} title="Zoom Out">
              <i className="fas fa-minus"></i>
            </button>
            <button className="control-button" onClick={handleResetView} title="Reset View">
              <i className="fas fa-home"></i>
            </button>
            <button className="control-button" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>
          </div>
        </div>
        
        <div className="controls-section">
          <h3 className="controls-title">🔄 Rotation Controls</h3>
          <div className="rotation-controls">
            <div className="rotation-row">
              <button className="control-button" onClick={handleRotateUp} title="Rotate Up">
                <i className="fas fa-chevron-up"></i>
              </button>
            </div>
            <div className="rotation-row">
              <button className="control-button" onClick={handleRotateLeft} title="Rotate Left">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="control-button" onClick={handleRotateRight} title="Rotate Right">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="rotation-row">
              <button className="control-button" onClick={handleRotateDown} title="Rotate Down">
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="controls-section">
          <h3 className="controls-title">🗺️ Pan Controls</h3>
          <div className="pan-controls">
            <div className="pan-row">
              <button className="control-button" onClick={() => setPanY(prev => prev - 50)} title="Pan Up">
                <i className="fas fa-arrow-up"></i>
              </button>
            </div>
            <div className="pan-row">
              <button className="control-button" onClick={() => setPanX(prev => prev - 50)} title="Pan Left">
                <i className="fas fa-arrow-left"></i>
              </button>
              <button className="control-button" onClick={() => setPanX(prev => prev + 50)} title="Pan Right">
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="pan-row">
              <button className="control-button" onClick={() => setPanY(prev => prev + 50)} title="Pan Down">
                <i className="fas fa-arrow-down"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="rotation-info">
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          <span>X: {Math.round(rotationX)}°</span>
          <span>Y: {Math.round(rotationY)}°</span>
          <span>Pan: ({Math.round(panX)}, {Math.round(panY)})</span>
        </div>
      </div>
      )}

      {/* Main 3D Isometric Cemetery Structure */}
      <div 
        ref={mapContainerRef}
        className="cemetery-3d-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="cemetery-structure"
          style={{
            transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoomLevel}) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Level 1 - Ground Level */}
          <div 
            className="cemetery-level level-1" 
            style={{ 
              transform: 'translateZ(0px)',
              opacity: isDefaultView || focusedLevel === 1 ? 1 : 0,
              pointerEvents: isDefaultView || focusedLevel === 1 ? 'auto' : 'none'
            }}
            onClick={() => handleLevelClick(1)}
          >
            <div className="level-label" onClick={() => handleLevelClick(1)}>L1</div>
            <div className="level-floor">
              <div className="cemetery-layout">
                {/* Main Central Aisle */}
                <div className="central-aisle"></div>

                {/* Top Section - Veterans, Office, Eternal Tomb */}
                <div className="top-section">
                  {/* Veterans Section */}
                  <div className="veterans-section">
                    <div className="section-label">VETERANS</div>
                    <div className="veterans-plots">
                      {['VET-L1-1A', 'VET-L1-1B', 'VET-L1-1C', 'VET-L1-1D'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot veterans-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Office Section - With Pin */}
                  <div className="office-section">
                    {/* Office Pin */}
                    <div 
                      className="office-pin" 
                      onMouseEnter={() => setShowOfficeTooltip(true)} 
                      onMouseLeave={() => setShowOfficeTooltip(false)}
                    >
                      <div className="pin-icon">🏢</div>
                    </div>
                    {/* Office Tooltip */}
                    {showOfficeTooltip && (
                      <div className="office-tooltip">
                        OFFICE
                      </div>
                    )}
                  </div>

                  {/* Eternal Tomb Section */}
                  <div className="eternal-tomb-section">
                    <div className="eternal-tomb-pin"
                         onMouseEnter={() => setShowOfficeTooltip(true)}
                         onMouseLeave={() => setShowOfficeTooltip(false)}>
                    </div>
                    {showOfficeTooltip && (
                      <div className="office-tooltip">ETERNAL TOMB</div>
                    )}
                  </div>
                </div>

                {/* Left Side Layout */}
                <div className="left-side-layout">
                  {/* Apartment V Column (Light Purple) */}
                  <div className="apartment-v-column">
                    <div className="section-label">APT V</div>
                    <div className="apartment-v-plots">
                      {['APT-V-1A', 'APT-V-1B', 'APT-V-1C', 'APT-V-1D', 'APT-V-1E', 'APT-V-1F', 'APT-V-2A', 'APT-V-2B', 'APT-V-2C', 'APT-V-2D', 'APT-V-2E', 'APT-V-2F', 'APT-V-3A', 'APT-V-3B', 'APT-V-3C'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot apartment-v-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Left Block Sections (Yellow) */}
                  <div className="left-block-sections">
                    <div className="section-label">LEFT BLOCK</div>
                    <div className="left-block-grid">
                      {Array.from({length: 72}, (_, index) => {
                        const row = Math.floor(index / 6);
                        const col = index % 6;
                        const plotId = `LB-L1-${String.fromCharCode(65 + row)}${col + 1}`;
                        return (
                          <div 
                            key={plotId}
                            className="cemetery-plot left-block-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId),
                              animationDelay: `${index * 0.02}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side Layout */}
                <div className="right-side-layout">
                  {/* Right Block Sections (Orange) */}
                  <div className="right-block-sections">
                    <div className="section-label">RIGHT BLOCK</div>
                    <div className="right-block-grid">
                      {Array.from({length: 72}, (_, index) => {
                        const row = Math.floor(index / 6);
                        const col = index % 6;
                        const plotId = `RB-L1-${String.fromCharCode(65 + row)}${col + 1}`;
                        return (
                          <div 
                            key={plotId}
                            className="cemetery-plot right-block-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId),
                              animationDelay: `${index * 0.02}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Apartment 2nd Level Column (Dark Purple) */}
                  <div className="apartment-2nd-column">
                    <div className="section-label">APT 2ND</div>
                    <div className="apartment-2nd-plots">
                      {['APT-2ND-1A', 'APT-2ND-1B', 'APT-2ND-1C', 'APT-2ND-1D', 'APT-2ND-1E', 'APT-2ND-1F', 'APT-2ND-2A', 'APT-2ND-2B', 'APT-2ND-2C', 'APT-2ND-2D', 'APT-2ND-2E', 'APT-2ND-2F', 'APT-2ND-3A', 'APT-2ND-3B', 'APT-2ND-3C'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot apartment-2nd-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restos Bonecrypt Column (Dark Brown) */}
                  <div className="restos-bonecrypt-column">
                    <div className="restos-bonecrypt-pin"
                         onMouseEnter={() => setShowOfficeTooltip(true)}
                         onMouseLeave={() => setShowOfficeTooltip(false)}>
                    </div>
                    {showOfficeTooltip && (
                      <div className="office-tooltip">RESTOS</div>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="bottom-section">
                  {/* Excess Lots/Vacant Lot (Dark Green) */}
                  <div className="excess-lots-section">
                    <div className="section-label">EXCESS LOTS</div>
                    <div className="excess-lots-area">
                      {['EXCESS-3A', 'EXCESS-3B', 'EXCESS-3C', 'EXCESS-3D'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot excess-lots-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            {/* Entrance Shape */}
            <div className="entrance-shape">
              <div 
                className="entrance-pin"
                onMouseEnter={() => setShowOfficeTooltip(true)}
                onMouseLeave={() => setShowOfficeTooltip(false)}
              ></div>
              {/* Entrance Tooltip */}
              {showOfficeTooltip && (
                <div className="office-tooltip">
                  ENTRANCE
                </div>
              )}
            </div>
          </div>

          {/* Level 2 */}
          <div 
            className="cemetery-level level-2" 
            style={{ 
              transform: 'translateZ(100px)',
              opacity: isDefaultView || focusedLevel === 2 ? 1 : 0,
              pointerEvents: isDefaultView || focusedLevel === 2 ? 'auto' : 'none'
            }}
            onClick={() => handleLevelClick(2)}
          >
            <div className="level-label">L2</div>
            <div className="level-floor">
              {/* Real Cemetery Layout Based on Your Design */}
              <div className="cemetery-layout">
                {/* Main Central Aisle */}
                <div className="central-aisle"></div>

                {/* Top Section - Veterans, Office, Eternal Tomb */}
                <div className="top-section">
                  {/* Veterans Section */}
                  <div className="veterans-section">
                    <div className="section-label">VETERANS</div>
                    <div className="veterans-plots">
                      {['VET-L2-2A', null, 'VET-L2-2B', null, null].map((plotId, index) => (
                        plotId ? (
                          <div 
                            key={plotId}
                            className="cemetery-plot veterans-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                              animationDelay: `${index * 0.1}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div key={`empty-${index}`} className="cemetery-plot veterans-plot empty-plot" style={{ backgroundColor: 'transparent', border: 'none' }}>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Office Section - With Pin */}
                  <div className="office-section">
                    {/* Office Pin */}
                    <div 
                      className="office-pin" 
                      onMouseEnter={() => setShowOfficeTooltip(true)} 
                      onMouseLeave={() => setShowOfficeTooltip(false)}
                    >
                      <div className="pin-icon">🏢</div>
                    </div>
                    {/* Office Tooltip */}
                    {showOfficeTooltip && (
                      <div className="office-tooltip">
                        OFFICE
                      </div>
                    )}
                  </div>

                  {/* Eternal Tomb Section */}
                  <div className="eternal-tomb-section">
                    <div className="eternal-tomb-pin"
                         onMouseEnter={() => setShowOfficeTooltip(true)}
                         onMouseLeave={() => setShowOfficeTooltip(false)}>
                    </div>
                    {showOfficeTooltip && (
                      <div className="office-tooltip">ETERNAL TOMB</div>
                    )}
                  </div>
                </div>

                {/* Left Side Layout */}
                <div className="left-side-layout">
                  {/* Apartment V Column (Light Purple) */}
                  <div className="apartment-v-column">
                    <div className="section-label">APT V</div>
                    <div className="apartment-v-plots">
                      {['APT-V-1A', 'APT-V-1B', 'APT-V-1C', 'APT-V-1D', 'APT-V-1E', 'APT-V-1F', 'APT-V-2A', 'APT-V-2B', 'APT-V-2C', 'APT-V-2D', 'APT-V-2E', 'APT-V-2F', 'APT-V-3A', 'APT-V-3B', 'APT-V-3C'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot apartment-v-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Left Block Sections (Yellow) */}
                  <div className="left-block-sections">
                    <div className="section-label">LEFT BLOCK</div>
                    <div className="left-block-grid">
                      {Array.from({length: 72}, (_, index) => {
                        const row = Math.floor(index / 6);
                        const col = index % 6;
                        const plotId = `LB-L2-${String.fromCharCode(65 + row)}${col + 1}`;
                        // Fixed random pattern for Level 2 (about 30% empty)
                        const emptyPositions = [1, 3, 5, 8, 12, 15, 18, 22, 25, 28, 31, 35, 38, 41, 45, 48, 51, 54, 58, 61, 64, 67];
                        const isEmpty = emptyPositions.includes(index);
                        
                        return isEmpty ? (
                          <div key={`empty-${index}`} className="cemetery-plot left-block-plot empty-plot" style={{ backgroundColor: 'transparent', border: 'none' }}>
                          </div>
                        ) : (
                          <div 
                            key={plotId}
                            className="cemetery-plot left-block-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId),
                              animationDelay: `${index * 0.02}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side Layout */}
                <div className="right-side-layout">
                  {/* Right Block Sections (Orange) */}
                  <div className="right-block-sections">
                    <div className="section-label">RIGHT BLOCK</div>
                    <div className="right-block-grid">
                      {Array.from({length: 72}, (_, index) => {
                        const row = Math.floor(index / 6);
                        const col = index % 6;
                        const plotId = `RB-L2-${String.fromCharCode(65 + row)}${col + 1}`;
                        // Fixed random pattern for Level 2 (about 30% empty)
                        const emptyPositions = [2, 4, 7, 9, 11, 14, 16, 19, 21, 24, 26, 29, 32, 34, 37, 39, 42, 44, 47, 49, 52, 55];
                        const isEmpty = emptyPositions.includes(index);
                        
                        return isEmpty ? (
                          <div key={`empty-${index}`} className="cemetery-plot right-block-plot empty-plot" style={{ backgroundColor: 'transparent', border: 'none' }}>
                          </div>
                        ) : (
                          <div 
                            key={plotId}
                            className="cemetery-plot right-block-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId),
                              animationDelay: `${index * 0.02}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Apartment 2nd Level Column (Dark Purple) */}
                  <div className="apartment-2nd-column">
                    <div className="section-label">APT 2ND</div>
                    <div className="apartment-2nd-plots">
                      {['APT-2ND-1A', 'APT-2ND-1B', 'APT-2ND-1C', 'APT-2ND-1D', 'APT-2ND-1E', 'APT-2ND-1F', 'APT-2ND-2A', 'APT-2ND-2B', 'APT-2ND-2C', 'APT-2ND-2D', 'APT-2ND-2E', 'APT-2ND-2F', 'APT-2ND-3A', 'APT-2ND-3B', 'APT-2ND-3C'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot apartment-2nd-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restos Bonecrypt Column (Dark Brown) */}
                  <div className="restos-bonecrypt-column">
                    <div className="restos-bonecrypt-pin"
                         onMouseEnter={() => setShowOfficeTooltip(true)}
                         onMouseLeave={() => setShowOfficeTooltip(false)}>
                    </div>
                    {showOfficeTooltip && (
                      <div className="office-tooltip">RESTOS</div>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="bottom-section">
                  {/* Excess Lots/Vacant Lot (Dark Green) */}
                  <div className="excess-lots-section">
                    <div className="section-label">EXCESS LOTS</div>
                    <div className="excess-lots-area">
                      {['EXCESS-3A', 'EXCESS-3B', 'EXCESS-3C', 'EXCESS-3D'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot excess-lots-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            {/* Entrance Shape */}
            <div className="entrance-shape">
              <div 
                className="entrance-pin"
                onMouseEnter={() => setShowOfficeTooltip(true)}
                onMouseLeave={() => setShowOfficeTooltip(false)}
              ></div>
              {/* Entrance Tooltip */}
              {showOfficeTooltip && (
                <div className="office-tooltip">
                  ENTRANCE
                </div>
              )}
            </div>
          </div>


          {/* Level 3 */}
          <div 
            className="cemetery-level level-3" 
            style={{ 
              transform: 'translateZ(200px)',
              opacity: isDefaultView || focusedLevel === 3 ? 1 : 0,
              pointerEvents: isDefaultView || focusedLevel === 3 ? 'auto' : 'none'
            }}
            onClick={() => handleLevelClick(3)}
          >
            <div className="level-label">L3</div>
            <div className="level-floor">
              {/* Real Cemetery Layout Based on Your Design */}
              <div className="cemetery-layout">
                {/* Main Central Aisle */}
                <div className="central-aisle"></div>

                {/* Top Section - Veterans, Office, Eternal Tomb */}
                <div className="top-section">
                  {/* Veterans Section */}
                  <div className="veterans-section">
                    <div className="section-label">VETERANS</div>
                    <div className="veterans-plots">
                      {[null, 'VET-L3-3A', null, 'VET-L3-3B', null].map((plotId, index) => (
                        plotId ? (
                          <div 
                            key={plotId}
                            className="cemetery-plot veterans-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                              animationDelay: `${index * 0.1}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div key={`empty-${index}`} className="cemetery-plot veterans-plot empty-plot" style={{ backgroundColor: 'transparent', border: 'none' }}>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Office Section - With Pin */}
                  <div className="office-section">
                    {/* Office Pin */}
                    <div 
                      className="office-pin" 
                      onMouseEnter={() => setShowOfficeTooltip(true)} 
                      onMouseLeave={() => setShowOfficeTooltip(false)}
                    >
                      <div className="pin-icon">🏢</div>
                    </div>
                    {/* Office Tooltip */}
                    {showOfficeTooltip && (
                      <div className="office-tooltip">
                        OFFICE
                      </div>
                    )}
                  </div>

                  {/* Eternal Tomb Section */}
                  <div className="eternal-tomb-section">
                    <div className="eternal-tomb-pin"
                         onMouseEnter={() => setShowOfficeTooltip(true)}
                         onMouseLeave={() => setShowOfficeTooltip(false)}>
                    </div>
                    {showOfficeTooltip && (
                      <div className="office-tooltip">ETERNAL TOMB</div>
                    )}
                  </div>
                </div>

                {/* Left Side Layout */}
                <div className="left-side-layout">
                  {/* Apartment V Column (Light Purple) */}
                  <div className="apartment-v-column">
                    <div className="section-label">APT V</div>
                    <div className="apartment-v-plots">
                      {['APT-V-1A', 'APT-V-1B', 'APT-V-1C', 'APT-V-1D', 'APT-V-1E', 'APT-V-1F', 'APT-V-2A', 'APT-V-2B', 'APT-V-2C', 'APT-V-2D', 'APT-V-2E', 'APT-V-2F', 'APT-V-3A', 'APT-V-3B', 'APT-V-3C'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot apartment-v-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Left Block Sections (Yellow) */}
                  <div className="left-block-sections">
                    <div className="section-label">LEFT BLOCK</div>
                    <div className="left-block-grid">
                      {Array.from({length: 72}, (_, index) => {
                        const row = Math.floor(index / 6);
                        const col = index % 6;
                        const plotId = `LB-L3-${String.fromCharCode(65 + row)}${col + 1}`;
                        // Level 3: About 30% of plots exist in Level 3 (realistic distribution)
                        const level2EmptyPositions = [1, 3, 5, 8, 12, 15, 18, 22, 25, 28, 31, 35, 38, 41, 45, 48, 51, 54, 58, 61, 64, 67];
                        const level3EmptyPositions = [0, 2, 4, 6, 7, 9, 10, 11, 13, 14, 16, 17, 19, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 34, 36, 37, 39, 40, 42, 43, 44, 46, 47, 49, 50];
                        // If empty in Level 2, also empty in Level 3. If empty in Level 3, also empty in Level 3.
                        const isEmpty = level2EmptyPositions.includes(index) || level3EmptyPositions.includes(index);
                        
                        return isEmpty ? (
                          <div key={`empty-${index}`} className="cemetery-plot left-block-plot empty-plot" style={{ backgroundColor: 'transparent', border: 'none' }}>
                          </div>
                        ) : (
                          <div 
                            key={plotId}
                            className="cemetery-plot left-block-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId),
                              animationDelay: `${index * 0.02}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side Layout */}
                <div className="right-side-layout">
                  {/* Right Block Sections (Orange) */}
                  <div className="right-block-sections">
                    <div className="section-label">RIGHT BLOCK</div>
                    <div className="right-block-grid">
                      {Array.from({length: 72}, (_, index) => {
                        const row = Math.floor(index / 6);
                        const col = index % 6;
                        const plotId = `RB-L3-${String.fromCharCode(65 + row)}${col + 1}`;
                        // Level 3: Some plots exist in both Level 2 and Level 3, some only in Level 2
                        const level2EmptyPositions = [2, 4, 7, 9, 11, 14, 16, 19, 21, 24, 26, 29, 32, 34, 37, 39, 42, 44, 47, 49, 52, 55];
                        const level3EmptyPositions = [0, 1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 23, 25, 27, 28, 30, 31, 33, 35, 36, 38, 40, 41, 43, 45, 46, 48, 50, 51, 53, 54];
                        // If empty in Level 2, also empty in Level 3. If empty in Level 3, also empty in Level 3.
                        const isEmpty = level2EmptyPositions.includes(index) || level3EmptyPositions.includes(index);
                        
                        return isEmpty ? (
                          <div key={`empty-${index}`} className="cemetery-plot right-block-plot empty-plot" style={{ backgroundColor: 'transparent', border: 'none' }}>
                          </div>
                        ) : (
                          <div 
                            key={plotId}
                            className="cemetery-plot right-block-plot"
                            onClick={() => handlePlotClick(plotId)}
                            onMouseEnter={() => setHoveredPlot(plotId)}
                            onMouseLeave={() => setHoveredPlot(null)}
                            style={{ 
                              backgroundColor: getPlotStatusColor(plotId),
                              animationDelay: `${index * 0.02}s`
                            }}
                          >
                            <div className="plot-label">{plotId}</div>
                            {hoveredPlot === plotId && (
                              <div className="office-tooltip">
                                {plotId}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Apartment 2nd Level Column (Dark Purple) */}
                  <div className="apartment-2nd-column">
                    <div className="section-label">APT 2ND</div>
                    <div className="apartment-2nd-plots">
                      {['APT-2ND-1A', 'APT-2ND-1B', 'APT-2ND-1C', 'APT-2ND-1D', 'APT-2ND-1E', 'APT-2ND-1F', 'APT-2ND-2A', 'APT-2ND-2B', 'APT-2ND-2C', 'APT-2ND-2D', 'APT-2ND-2E', 'APT-2ND-2F', 'APT-2ND-3A', 'APT-2ND-3B', 'APT-2ND-3C'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot apartment-2nd-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restos Bonecrypt Column (Dark Brown) */}
                  <div className="restos-bonecrypt-column">
                    <div className="restos-bonecrypt-pin"
                         onMouseEnter={() => setShowOfficeTooltip(true)}
                         onMouseLeave={() => setShowOfficeTooltip(false)}>
                    </div>
                    {showOfficeTooltip && (
                      <div className="office-tooltip">RESTOS</div>
                    )}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="bottom-section">
                  {/* Excess Lots/Vacant Lot (Dark Green) */}
                  <div className="excess-lots-section">
                    <div className="section-label">EXCESS LOTS</div>
                    <div className="excess-lots-area">
                      {['EXCESS-1A', 'EXCESS-1B', 'EXCESS-1C', 'EXCESS-1D'].map((plotId, index) => (
                        <div 
                          key={plotId}
                          className="cemetery-plot excess-lots-plot"
                          onClick={() => handlePlotClick(plotId)}
                          onMouseEnter={() => setHoveredPlot(plotId)}
                          onMouseLeave={() => setHoveredPlot(null)}
                          style={{ 
                            backgroundColor: getPlotStatusColor(plotId) || '#16a34a',
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <div className="plot-label">{plotId}</div>
                          {hoveredPlot === plotId && (
                            <div className="office-tooltip">
                              {plotId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            {/* Entrance Shape */}
            <div className="entrance-shape">
              <div 
                className="entrance-pin"
                onMouseEnter={() => setShowOfficeTooltip(true)}
                onMouseLeave={() => setShowOfficeTooltip(false)}
              ></div>
              {/* Entrance Tooltip */}
              {showOfficeTooltip && (
                <div className="office-tooltip">
                  ENTRANCE
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Search Sidebar */}
      <div className={`cemetery-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Toggle Button */}
        <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
        
        {!sidebarCollapsed && (
          <>
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search plots..." 
                className="search-input"
              />
            </div>
            
            {/* Controls Toggle */}
            <div className="controls-toggle-section">
              <button className="controls-toggle-button" onClick={toggleControls} title={showControls ? "Hide Controls" : "Show Controls"}>
                <i className="fas fa-cog"></i>
                {showControls ? "Hide Controls" : "Show Controls"}
              </button>
            </div>
          </>
        )}
        
        {!sidebarCollapsed && (
          <>
            <div className="alphabetical-index">A-Z</div>
            
            <div className="section-categories">
          <div className="category">
            <h4 className="category-title">Traditional Burials</h4>
            <div className="category-items">
              <div className="category-item" onClick={() => handleSectionClick('left-block')}>
                <span className="item-name">Left Block</span>
              </div>
              <div className="category-item" onClick={() => handleSectionClick('right-block')}>
                <span className="item-name">Right Block</span>
              </div>
            </div>
          </div>

          <div className="category">
            <h4 className="category-title">Multi-Level Burials</h4>
            <div className="category-items">
              <div className="category-item" onClick={() => handleSectionClick('apartment-section')}>
                <span className="item-name">Apartment Section</span>
              </div>
            </div>
          </div>

          <div className="category">
            <h4 className="category-title">Special Sections</h4>
            <div className="category-items">
              <div className="category-item" onClick={() => handleSectionClick('veterans-section')}>
                <span className="item-name">Veterans Section</span>
              </div>
              <div className="category-item" onClick={() => handleSectionClick('eternal-tomb')}>
                <span className="item-name">Eternal Tomb</span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Level Selector */}
      {showLevelSelector && (
        <div className="level-selector-overlay">
          <div className="level-selector">
            <h3 className="text-xl font-bold mb-4">Select Level</h3>
            <div className="level-buttons">
              {availableLevels.map(level => (
                <button
                  key={level}
                  onClick={() => handleLevelSelection(level)}
                  className="level-button"
                >
                  <div className="level-number">{level}</div>
                  <div className="level-description">{getLevelDescription(level)}</div>
                </button>
              ))}
            </div>
            <button 
              onClick={handleBackToOverview}
              className="back-button"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
      )}



      {/* Exhumation Request Modal */}
      {showExhumationModal && (
        <ExhumationRequestModal
          isOpen={showExhumationModal}
          onClose={() => setShowExhumationModal(false)}
          plotData={exhumationPlotData}
          onSubmit={handleExhumationSubmit}
        />
      )}

      {/* Plot Details Modal */}
      {showPlotModal && selectedTomb && (
        <PlotDetailsModal
          plot={selectedTomb.deceasedData}
          onClose={() => setShowPlotModal(false)}
          onRequestExhumation={(plot, type) => {
            setExhumationType(type);
            setShowExhumationForm(true);
            setShowPlotModal(false);
          }}
          onReservePlot={(plot) => {
            setShowReservationForm(true);
            setShowPlotModal(false);
          }}
          onPlotUpdated={() => {
            console.log('🔄 Plot updated, reloading map data...');
            loadPlots();
          }}
        />
      )}

      {/* Exhumation Request Form */}
      {showExhumationForm && selectedTomb && (
        <ExhumationRequestForm
          plot={selectedTomb.deceasedData}
          requestType={exhumationType}
          onClose={() => setShowExhumationForm(false)}
          onSuccess={() => {
            alert('Exhumation request submitted successfully!');
            setShowExhumationForm(false);
            setSelectedTomb(null);
            setExhumationType(null);
          }}
        />
      )}

      {/* Plot Reservation Form */}
      {showReservationForm && selectedTomb && (
        <PlotReservationForm
          plot={selectedTomb.deceasedData}
          onClose={() => setShowReservationForm(false)}
          onSuccess={() => {
            alert('Plot reservation submitted successfully! You will be contacted for payment and verification.');
            setShowReservationForm(false);
            setSelectedTomb(null);
          }}
        />
      )}
    </div>
  );
};

export default HardcodedCemeteryMap;
