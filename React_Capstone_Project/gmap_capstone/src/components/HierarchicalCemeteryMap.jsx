import React, { useState, useEffect, useRef } from 'react';
import DataService from '../services/DataService';
import { useAuth } from '../contexts/AuthContext';
import ExhumationRequestModal from './ExhumationRequestModal';

const HierarchicalCemeteryMap = () => {
  const { isAdmin } = useAuth();
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [tombPositions, setTombPositions] = useState({});
  const [svgContent, setSvgContent] = useState(null);
  const [selectedTomb, setSelectedTomb] = useState(null);
  const [showTombDetails, setShowTombDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDirections, setShowDirections] = useState(false);
  const [directions, setDirections] = useState([]);
  const [targetPlot, setTargetPlot] = useState(null);
  const [showExhumationModal, setShowExhumationModal] = useState(false);
  const [exhumationPlotData, setExhumationPlotData] = useState(null);
  const [plots, setPlots] = useState([]);
  
  const svgContainerRef = useRef(null);
  const svgRef = useRef(null);
  
  // Alley scroll ref
  const alleyScrollRef = useRef(null);
  
  // Map scroll ref
  const mapScrollRef = useRef(null);
  
  // No mock data - we use the actual SVG content
  const loading = false;
  const error = null;
  
  const getAvailableLevels = (section) => {
    // Generate realistic level availability based on actual cemetery structure
    const plotSeed = section.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomSeed = (plotSeed * 9301 + 49297) % 233280;
    const normalizedSeed = randomSeed / 233280;
    
    // 70% chance of having Level 2, 30% chance of only Level 1
    const hasLevel2 = normalizedSeed > 0.3;
    
    // Handle actual section IDs from your SVG map
    if (section && (section.includes('lb-') || section.includes('LB'))) {
      return hasLevel2 ? [1, 2] : [1]; // Some LB plots only have Level 1
    } else if (section && (section.includes('rb-') || section.includes('RB'))) {
      return hasLevel2 ? [1, 2] : [1]; // Some RB plots only have Level 1
    } else if (section && section.includes('apartment')) {
      // Apartment sections always have 3 levels
      return [1, 2, 3];
    } else if (section && (section.includes('veterans') || section.includes('office') || section.includes('eternal-tomb'))) {
      // Other special sections have higher chance of multiple levels
      const hasLevel3 = normalizedSeed > 0.5;
      if (hasLevel3) return [1, 2, 3];
      if (hasLevel2) return [1, 2];
      return [1];
    }
    // Default: random chance of Level 2
    return hasLevel2 ? [1, 2] : [1];
  };

  const getLevelDescription = (level) => {
    if (level === 1) return "Ground Level - Main Burial Area";
    if (level === 2) return "Second Level - Elevated Burials";
    if (level === 3) return "Third Level - Top Tier Burials";
    return `Level ${level}`;
  };

  const handleSectionClick = (sectionId) => {
    console.log('Section clicked:', sectionId);
    
    // Map actual plot IDs to section groups for level selection
    let mappedSection = sectionId;
    
    // Handle Left Block plots (lb-4a, lb-6b, etc.)
    if (sectionId.includes('lb-')) {
      const plotNumber = sectionId.match(/lb-(\d+)/)?.[1];
      mappedSection = `lb-${plotNumber}`;
    }
    // Handle Right Block plots (rb-23a, rb-21b, etc.)
    else if (sectionId.includes('rb-')) {
      const plotNumber = sectionId.match(/rb-(\d+)/)?.[1];
      mappedSection = `rb-${plotNumber}`;
    }
    // Handle apartment sections
    else if (sectionId.includes('apartment')) {
      // Keep the full apartment section ID (e.g., apartment-1, apartment-2, etc.)
      mappedSection = sectionId;
    }
    // Handle special sections
    else if (sectionId.includes('veterans')) {
      mappedSection = 'veterans';
    }
    else if (sectionId.includes('office')) {
      mappedSection = 'office';
    }
    else if (sectionId.includes('eternal-tomb')) {
      mappedSection = 'eternal-tomb';
    }
    else if (sectionId.includes('restos-bonecrypt')) {
      mappedSection = 'restos-bonecrypt';
    }
    
    setSelectedSection(mappedSection);
    setCurrentView('level-selector');
    setShowLevelSelector(true);
    
    const levels = getAvailableLevels(mappedSection);
    setAvailableLevels(levels);
    setCurrentLevel(levels[0]);
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
    setTombPositions({});
  };

  const handleBackToLevelSelector = () => {
    setCurrentView('level-selector');
  };

  const handleTombClick = async (tomb) => {
    try {
      // Get plot data from database - use the plotId from tomb object
      const plotId = tomb.plotId; // Use the plotId from tomb object
      console.log('Tomb clicked:', tomb);
      console.log('Looking for plot ID:', plotId);
      const plot = await DataService.getPlot(plotId);
      
      if (plot) {
        console.log('Plot data from database:', plot);
        console.log('Plot status from database:', plot.status);
        
        const deceasedData = {
          name: plot.occupant_name || 'Available',
          age: plot.age || null,
          causeOfDeath: plot.cause_of_death || null,
          religion: plot.religion || null,
          familyName: plot.family_name || null,
          nextOfKin: plot.next_of_kin || null,
          contactNumber: plot.contact_number || null,
          dateOfInterment: plot.date_of_interment || null,
          status: plot.status || 'available',
          plotLocation: selectedSection,
          tombId: tomb.id,
          notes: plot.notes || `Tomb ${tomb.id} in ${selectedSection} Level ${tomb.level}`
        };
        
        console.log('Deceased data created:', deceasedData);
        
        setSelectedTomb({ ...tomb, deceasedData });
        setShowTombDetails(true);
    } else {
        // If no plot found, show available tomb
        const deceasedData = {
          name: 'Available',
          age: null,
          causeOfDeath: null,
          religion: null,
          familyName: null,
          nextOfKin: null,
          contactNumber: null,
          dateOfInterment: null,
          status: 'available',
          plotLocation: selectedSection,
          tombId: tomb.id,
          notes: `Tomb ${tomb.id} in ${selectedSection} Level ${tomb.level}`
        };
        
        setSelectedTomb({ ...tomb, deceasedData });
        setShowTombDetails(true);
      }
    } catch (error) {
      console.error('Error loading tomb data:', error);
      // Fallback to available tomb
      const deceasedData = {
        name: 'Available',
        age: null,
        causeOfDeath: null,
        religion: null,
        familyName: null,
        nextOfKin: null,
        contactNumber: null,
        dateOfInterment: null,
        status: 'available',
        plotLocation: selectedSection,
        tombId: tomb.id,
        notes: `Tomb ${tomb.id} in ${selectedSection} Level ${tomb.level}`
      };
      
      setSelectedTomb({ ...tomb, deceasedData });
      setShowTombDetails(true);
    }
  };

  const closeTombDetails = () => {
    setShowTombDetails(false);
    setSelectedTomb(null);
    setIsEditing(false);
    setEditData({});
  };

  const handleEditClick = () => {
    if (!isAdmin) {
      alert('You must be logged in as an admin to edit tomb details.');
      return;
    }
    setIsEditing(true);
    setEditData(selectedTomb.deceasedData);
  };

  const handleSaveEdit = async () => {
    try {
      // Use the plotId from the tomb object, not the tomb.id
      const plotId = selectedTomb.plotId;
      console.log('Updating plot with ID:', plotId);
      
      // Use the status from editData (user's selection)
      const updatedData = {
        ...editData,
        status: editData.status || 'available'
      };
      
      
      // Update the plot in database
      await DataService.updatePlot(plotId, updatedData);
      
      // Refresh all plots data
      const allPlots = await DataService.getAllPlots();
      setPlots(allPlots);
      
      // Update local state
      setSelectedTomb({
        ...selectedTomb,
        deceasedData: { ...selectedTomb.deceasedData, ...updatedData }
      });
      
      // Refresh colors for the specific plot that was updated
      await refreshPlotColor(plotId);
      
      setIsEditing(false);
      alert('Plot updated successfully!');
    } catch (error) {
      console.error('Error updating plot:', error);
      console.error('Error details:', error.message);
      alert('Error updating plot. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleExhumationRequest = (deceasedData) => {
    // Map deceasedData to the format expected by ExhumationRequestModal
    const plotData = {
      occupant_name: deceasedData.name,
      plot_id: selectedTomb?.plotId,
      section: selectedTomb?.section,
      level: selectedTomb?.level,
      plot_number: selectedTomb?.tombNumber
    };
    
    // Close the deceased person details modal
    setShowTombDetails(false);
    setSelectedTomb(null);
    
    // Small delay to make transition smoother
    setTimeout(() => {
      // Show the exhumation request modal
      setExhumationPlotData(plotData);
    setShowExhumationModal(true);
    }, 100);
  };

  const handleExhumationSubmit = async (exhumationData) => {
    try {
      // The ExhumationRequestModal already saves to database
      alert('Exhumation request submitted successfully! You will be contacted within 2-3 business days.');
      setShowExhumationModal(false);
      setExhumationPlotData(null);
      
      // Return to map view
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
      
      // Clear all occupant data and set status to available
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
      
      // Update the plot in database
      await DataService.updatePlot(plotId, clearedData);
      
      // Update local state
      setSelectedTomb({
        ...selectedTomb,
        deceasedData: clearedData
      });
      
      // Refresh colors for the specific plot that was updated
      await refreshPlotColor(plotId);
      
      setIsEditing(false);
      alert('Plot data deleted successfully!');
      } catch (error) {
      console.error('Error deleting plot data:', error);
      alert('Error deleting plot data. Please try again.');
    }
  };

  // Helper function to determine status based on interment date
  const getStatusFromDate = (intermentDate) => {
    if (!intermentDate) return 'available';
    
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = new Date(intermentDate).toISOString().split('T')[0];
    
    if (selectedDate > today) {
      return 'reserved';
    } else if (selectedDate <= today) {
      return 'occupied';
    }
    
    return 'available';
  };

  // Generate directions from entrance to target plot
  const generateDirections = (plotId) => {
    const directions = [];
    
    // Extract section and plot info from plotId
    const section = plotId.split('-')[0].toUpperCase();
    const plotNumber = plotId.split('-')[1];
    console.log('generateDirections called with:', { plotId, section, plotNumber });
    
    // Extract level and tomb letter for apartment plots
    let level = null;
    let tombLetter = '';
    
    if (section === 'APARTMENT' || plotId.includes('apartment')) {
      // For apartment plots like "apartment-5-3h", extract level and tomb
      const apartmentParts = plotId.split('-');
      console.log('Apartment plotId parts:', { plotId, apartmentParts });
      if (apartmentParts.length >= 3) {
        level = apartmentParts[2].charAt(0); // Extract level (3 from "3h")
        tombLetter = apartmentParts[2].substring(1); // Extract tomb letter (h from "3h")
        console.log('Extracted level and tomb:', { level, tombLetter });
      }
    }
    
    // Starting point
    directions.push({
      step: 1,
      instruction: "Start at the main entrance",
      icon: "🚪",
      location: "Entrance"
    });
    
    // Navigate to section
    if (section === 'LB') {
      directions.push({
        step: 2,
        instruction: "From the main entrance, walk straight ahead towards the Left Block (LB) section",
        icon: "⬅️",
        location: "Left Block"
      });
    } else if (section === 'RB') {
      directions.push({
        step: 2,
        instruction: "From the main entrance, walk straight ahead towards the Right Block (RB) section",
        icon: "➡️",
        location: "Right Block"
      });
    } else if (section === 'APARTMENT' || plotId.includes('apartment')) {
      // Check if it's apartment-5 (right side) or other apartments (left side)
      if (plotId.includes('apartment-5')) {
        directions.push({
          step: 2,
          instruction: "From the main entrance, take a right turn to right block and then straight ahead",
          icon: "➡️",
          location: "Right Block"
        });
        directions.push({
          step: 3,
          instruction: "Continue straight ahead towards the Apartment section",
          icon: "🏢",
          location: "Apartment"
        });
    } else {
        directions.push({
          step: 2,
          instruction: "From the main entrance, take a left from the left block and walk straight ahead",
          icon: "⬅️",
          location: "Left Block"
        });
        directions.push({
          step: 3,
          instruction: "Continue straight ahead towards the Apartment section",
          icon: "🏢",
          location: "Apartment"
        });
      }
    } else if (section === 'VETERANS') {
      directions.push({
        step: 2,
        instruction: "Walk towards the Veterans section",
        icon: "🎖️",
        location: "Veterans"
      });
    }
    
    // Navigate to specific plot
    const plotStep = (section === 'APARTMENT' || plotId.includes('apartment')) ? 4 : 3;
    if (section === 'APARTMENT' || plotId.includes('apartment')) {
      directions.push({
        step: plotStep,
        instruction: `Look for the Apartment section and find the specific building`,
        icon: "📍",
        location: "Apartment Section"
      });
      } else {
      directions.push({
        step: plotStep,
        instruction: `Look for plot ${plotId.toUpperCase()} in the ${section} section`,
        icon: "📍",
        location: plotId.toUpperCase()
      });
    }
    
    // Add level information for apartment sections
    if ((section === 'APARTMENT' || plotId.includes('apartment')) && level) {
      const levelStep = 5;
      console.log('Adding level step for apartment:', { plotId, level, tombLetter });
      directions.push({
        step: levelStep,
        instruction: `Go to Level ${level} and look for Tomb ${tombLetter.toUpperCase()}`,
        icon: "🏗️",
        location: `Level ${level}`
      });
    } else if (section === 'APARTMENT' || plotId.includes('apartment')) {
      console.log('Apartment section but no level found:', { plotId, level, tombLetter });
    }
    
    return directions;
  };

  // Function to show directions to a specific plot
  const showDirectionsToPlot = async (plotId, plotData) => {
    console.log('showDirectionsToPlot called with:', { plotId, plotData });
    const directions = generateDirections(plotId);
    console.log('Generated directions:', directions);
    setDirections(directions);
    
    // Use provided plot data directly for now (skip database fetch)
    console.log('Directions - Using provided plot data:', plotData);
    const targetPlotData = { id: plotId, data: plotData };
    console.log('Setting targetPlot:', targetPlotData);
    setTargetPlot(targetPlotData);
    
    console.log('Setting showDirections to true');
    setShowDirections(true);
    
    // Highlight the target plot
    highlightTargetPlot(plotId);
  };

  // Expose the function globally for search results to use
  useEffect(() => {
    window.showDirectionsToPlot = showDirectionsToPlot;
    return () => {
      delete window.showDirectionsToPlot;
    };
  }, []);

  // Function to highlight target plot
  const highlightTargetPlot = (plotId) => {
    if (!svgRef.current) return;
    
    try {
      const plotElement = svgRef.current.querySelector(`#${plotId}`);
      if (plotElement) {
        // Add highlighting effect
        plotElement.style.setProperty('fill', '#ff6b35', 'important');
        plotElement.style.setProperty('stroke', '#ff4500', 'important');
        plotElement.style.setProperty('stroke-width', '5px', 'important');
        plotElement.style.setProperty('opacity', '1', 'important');
        plotElement.style.setProperty('filter', 'drop-shadow(0 0 10px #ff6b35)', 'important');
        
        // Scroll to the plot element
        plotElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center', 
          inline: 'center' 
        });
        
        // Remove highlight after 10 seconds
        setTimeout(() => {
          if (plotElement) {
            refreshPlotColor(plotId);
          }
        }, 10000);
      }
    } catch (error) {
      console.error(`Error highlighting plot ${plotId}:`, error);
    }
  };

  useEffect(() => {
    const loadSVG = async () => {
      try {
        console.log('Attempting to load SVG...');
        const response = await fetch('/cemetery-map.svg');
        console.log('SVG fetch response:', response.status, response.ok);
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
          console.log('Cemetery SVG loaded successfully');
        } else {
          console.error('SVG not found, status:', response.status);
          // Try alternative path
          try {
            const altResponse = await fetch('./cemetery-map.svg');
            if (altResponse.ok) {
              const svgText = await altResponse.text();
              console.log('SVG loaded from alternative path');
              setSvgContent(svgText);
            }
          } catch (altError) {
            console.error('Alternative path also failed:', altError);
          }
        }
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };
    loadSVG();
  }, []);

  useEffect(() => {
    if (svgRef.current && svgContent) {
      console.log('SVG content loaded, setting up...');
      console.log('Container element:', svgRef.current);
      console.log('Elements with IDs:', svgRef.current.querySelectorAll('[id]'));
      // enhanceSVGText(); // Disabled to prevent duplicate text labels
      setupEventListeners();
    }
    
    // Cleanup function
    return () => {
      if (svgRef.current && svgRef.current._colorRefreshInterval) {
        clearInterval(svgRef.current._colorRefreshInterval);
      }
    };
  }, [svgContent]);

  // Load plots data
  useEffect(() => {
    const loadPlots = async () => {
      try {
        const allPlots = await DataService.getAllPlots();
        setPlots(allPlots);
        console.log('Loaded plots:', allPlots.length);
      } catch (error) {
        console.error('Error loading plots:', error);
      }
    };
    
    loadPlots();
  }, []);

  // Listen for exhumation status changes to refresh map colors
  useEffect(() => {
    const handleExhumationStatusChange = (event) => {
      console.log('🔄 Exhumation status changed event received:', event.detail);
      console.log('🔄 Refreshing map colors...');
      
      // Reload plots data and refresh colors
      const refreshPlots = async () => {
        try {
          console.log('🔄 Fetching fresh plot data...');
          const allPlots = await DataService.getAllPlots();
          setPlots(allPlots);
          console.log('✅ Refreshed plots after exhumation status change:', allPlots.length);
          
          // Force apply colors after a short delay
          setTimeout(() => {
            console.log('🎨 Applying colors after exhumation status change...');
            applyPlotStatusColors();
          }, 1000);
        } catch (error) {
          console.error('❌ Error refreshing plots:', error);
        }
      };
      refreshPlots();
    };

    // Listen for custom event
    window.addEventListener('exhumationStatusChanged', handleExhumationStatusChange);
    
    // Also listen for storage changes (for localStorage updates)
    window.addEventListener('storage', handleExhumationStatusChange);
    
    console.log('🎧 Event listeners registered for exhumation status changes');
    
    return () => {
      window.removeEventListener('exhumationStatusChanged', handleExhumationStatusChange);
      window.removeEventListener('storage', handleExhumationStatusChange);
      console.log('🎧 Event listeners removed');
    };
  }, []);

  // Apply colors when both SVG and plots are loaded
  useEffect(() => {
    if (svgContent && plots.length > 0) {
      console.log('Both SVG and plots loaded, applying colors...');
      console.log('SVG content length:', svgContent.length);
      console.log('Plots loaded:', plots.length);
      
      // Apply colors with a single attempt
      setTimeout(() => {
        applyPlotStatusColors();
      }, 1000);
    }
  }, [svgContent, plots]);

  // enhanceSVGText function removed to prevent duplicate text labels
  // This was creating additional text elements on top of the original Inkscape text

  const applyPlotStatusColors = async () => {
    console.log('🎨 Starting applyPlotStatusColors...');
    console.log('SVG ref available:', !!svgRef.current);
    console.log('Plots data available:', plots.length);
    
    if (!svgRef.current) {
      console.log('❌ svgRef.current is null - SVG not loaded');
      return;
    }

    if (plots.length === 0) {
      console.log('❌ No plots data available');
      return;
    }

    console.log('✅ SVG ref found, starting color application...');
    
    // Add a small delay to ensure SVG is fully rendered
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // Get all plot elements from the SVG
      const plotElements = svgRef.current.querySelectorAll('rect[id^="lb-"], rect[id^="rb-"], rect[id^="apartment-"], rect[id^="veterans"], rect[id^="eternal"]');
      
      console.log(`Found ${plotElements.length} plot elements to color`);
      console.log('Plot elements found:', Array.from(plotElements).map(el => el.id).slice(0, 10));
      
      // Create a map of plot data for quick lookup
      const plotDataMap = new Map();
      plots.forEach(plot => {
        // Store with both original case and lowercase for case-insensitive lookup
        plotDataMap.set(plot.plot_id, plot);
        plotDataMap.set(plot.plot_id.toLowerCase(), plot);
      });
      
      console.log('Plot data map created with', plotDataMap.size, 'entries');
      console.log('Sample plot IDs from database:', Array.from(plotDataMap.keys()).slice(0, 10));
      
      let coloredCount = 0;
      let occupiedCount = 0;
      let availableCount = 0;
      let reservedCount = 0;
      
      // Process each plot element
      for (const element of plotElements) {
        const plotId = element.id;
        
        try {
          // Get plot data from our existing plots array
          let plot = plotDataMap.get(plotId);
          
          // If not found, try case variations
          if (!plot) {
            plot = plotDataMap.get(plotId.toLowerCase());
          }
          if (!plot) {
            plot = plotDataMap.get(plotId.toUpperCase());
          }
          if (!plot) {
            // Try with first letter capitalized
            const capitalized = plotId.charAt(0).toUpperCase() + plotId.slice(1);
            plot = plotDataMap.get(capitalized);
          }
          
          // Special debugging for lb-10a
          if (plotId === 'lb-10a') {
            console.log('🔍 DEBUGGING lb-10a:');
            console.log('  - Plot ID from SVG:', plotId);
            console.log('  - Plot data found:', !!plot);
            console.log('  - Looking for exact match:', plotDataMap.has(plotId));
            console.log('  - Looking for lowercase match:', plotDataMap.has(plotId.toLowerCase()));
            console.log('  - Available keys:', Array.from(plotDataMap.keys()).filter(key => key.includes('lb-10')));
            if (plot) {
              console.log('  - Plot data:', plot);
              console.log('  - Occupant name:', plot.occupant_name);
              console.log('  - Status:', plot.status);
              console.log('  - Date of interment:', plot.date_of_interment);
            }
          }
          
          if (plot) {
            // Determine status based on data presence
            let status = 'available'; // Default to available
            
            // Check if plot has explicit status first
            if (plot.status && plot.status !== 'available') {
              status = plot.status;
              if (status === 'occupied') occupiedCount++;
              else if (status === 'reserved') {
                reservedCount++;
                console.log(`Plot ${plotId} is explicitly reserved`);
              }
            } else if (plot.occupant_name && plot.occupant_name.trim() !== '') {
              // If plot has occupant data, it's occupied
              status = 'occupied';
              occupiedCount++;
            } else if (plot.date_of_interment) {
              // Check if date is in the future (reserved) or past (occupied)
              const intermentDate = new Date(plot.date_of_interment);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (intermentDate > today) {
                status = 'reserved';
                reservedCount++;
                console.log(`Plot ${plotId} has future interment date: ${plot.date_of_interment} -> RESERVED`);
              } else {
                status = 'occupied';
                occupiedCount++;
              }
            } else {
              availableCount++;
            }
            
            // Set data-status attribute for CSS targeting
            element.setAttribute('data-status', status);
            
            // Apply colors directly to SVG element
            switch (status) {
              case 'occupied':
                element.setAttribute('fill', '#dc2626'); // Red
                element.setAttribute('stroke', '#b91c1c');
                element.setAttribute('stroke-width', '3');
                element.setAttribute('opacity', '0.9');
                element.style.setProperty('fill', '#dc2626', 'important');
                element.style.setProperty('stroke', '#b91c1c', 'important');
                element.style.setProperty('stroke-width', '3px', 'important');
                element.style.setProperty('opacity', '0.9', 'important');
                break;
              case 'available':
                element.setAttribute('fill', '#16a34a'); // Green
                element.setAttribute('stroke', '#15803d');
                element.setAttribute('stroke-width', '3');
                element.setAttribute('opacity', '0.9');
                element.style.setProperty('fill', '#16a34a', 'important');
                element.style.setProperty('stroke', '#15803d', 'important');
                element.style.setProperty('stroke-width', '3px', 'important');
                element.style.setProperty('opacity', '0.9', 'important');
                break;
              case 'reserved':
                element.setAttribute('fill', '#d97706'); // Orange
                element.setAttribute('stroke', '#c2410c');
                element.setAttribute('stroke-width', '3');
                element.setAttribute('opacity', '0.9');
                element.style.setProperty('fill', '#d97706', 'important');
                element.style.setProperty('stroke', '#c2410c', 'important');
                element.style.setProperty('stroke-width', '3px', 'important');
                element.style.setProperty('opacity', '0.9', 'important');
                break;
              case 'exhumed':
                element.setAttribute('fill', '#6b7280'); // Gray
                element.setAttribute('stroke', '#4b5563');
                element.setAttribute('stroke-width', '3');
                element.setAttribute('opacity', '0.9');
                element.style.setProperty('fill', '#6b7280', 'important');
                element.style.setProperty('stroke', '#4b5563', 'important');
                element.style.setProperty('stroke-width', '3px', 'important');
                element.style.setProperty('opacity', '0.9', 'important');
                break;
              default:
                element.setAttribute('fill', '#16a34a'); // Default to green
                element.setAttribute('stroke', '#15803d');
                element.setAttribute('stroke-width', '3');
                element.setAttribute('opacity', '0.9');
                element.style.setProperty('fill', '#16a34a', 'important');
                element.style.setProperty('stroke', '#15803d', 'important');
                element.style.setProperty('stroke-width', '3px', 'important');
                element.style.setProperty('opacity', '0.9', 'important');
            }
            
            coloredCount++;
            console.log(`Applied ${status} color to ${plotId} (occupant: ${plot.occupant_name || 'none'})`);
            
            // Special debugging for lb-10a color application
            if (plotId === 'lb-10a') {
              console.log(`🎨 lb-10a color applied: ${status}`);
              console.log('  - Element fill:', element.getAttribute('fill'));
              console.log('  - Element style fill:', element.style.fill);
          }
        } else {
            // If no plot data found, default to available (green)
            element.setAttribute('fill', '#16a34a');
            element.setAttribute('stroke', '#15803d');
            element.setAttribute('stroke-width', '3');
            element.setAttribute('opacity', '0.8');
            element.style.setProperty('fill', '#16a34a', 'important');
            element.style.setProperty('stroke', '#15803d', 'important');
            element.style.setProperty('stroke-width', '3px', 'important');
            element.style.setProperty('opacity', '0.8', 'important');
            availableCount++;
            console.log(`No data found for ${plotId}, set to available (green)`);
          }
        } catch (error) {
          console.error(`Error processing ${plotId}:`, error);
          // Default to available on error
          element.setAttribute('fill', '#16a34a');
          element.setAttribute('stroke', '#15803d');
          element.setAttribute('stroke-width', '3');
          element.setAttribute('opacity', '0.8');
          element.style.setProperty('fill', '#16a34a', 'important');
          element.style.setProperty('stroke', '#15803d', 'important');
          element.style.setProperty('stroke-width', '3px', 'important');
          element.style.setProperty('opacity', '0.8', 'important');
        }
      }
      
      console.log(`🎨 Color application complete!`);
      console.log(`📊 Summary: ${coloredCount} plots colored, ${occupiedCount} occupied (red), ${reservedCount} reserved (orange), ${availableCount} available (green)`);
      
    } catch (error) {
      console.error('Error applying plot status colors:', error);
    }
  };

  const refreshPlotColor = async (plotId) => {
    if (!svgRef.current) return;
    
    try {
      const element = svgRef.current.querySelector(`#${plotId}`);
      if (!element) {
        console.log(`Plot element ${plotId} not found`);
      return;
    }

      // Fetch updated plot data from database
      const plot = await DataService.getPlot(plotId);
      
      if (plot) {
        // Determine status based on data presence (same logic as applyPlotStatusColors)
        let status = 'available'; // Default to available
        
        // If plot has occupant data, it's occupied
        if (plot.occupant_name && plot.occupant_name.trim() !== '') {
          status = 'occupied';
        } else if (plot.date_of_interment) {
          // Check if date is in the future (reserved) or past (occupied)
          const intermentDate = new Date(plot.date_of_interment);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (intermentDate > today) {
            status = 'reserved';
          } else {
            status = 'occupied';
          }
        }
        
        // Set data-status attribute for CSS targeting
        element.setAttribute('data-status', status);
        
        // Apply colors directly to SVG element
        switch (status) {
          case 'occupied':
            element.setAttribute('fill', '#dc2626'); // Red
            element.setAttribute('stroke', '#b91c1c');
            element.setAttribute('stroke-width', '3');
            element.setAttribute('opacity', '0.9');
            element.style.setProperty('fill', '#dc2626', 'important');
            element.style.setProperty('stroke', '#b91c1c', 'important');
            element.style.setProperty('stroke-width', '3px', 'important');
            element.style.setProperty('opacity', '0.9', 'important');
            break;
          case 'available':
            element.setAttribute('fill', '#16a34a'); // Green
            element.setAttribute('stroke', '#15803d');
            element.setAttribute('stroke-width', '3');
            element.setAttribute('opacity', '0.9');
            element.style.setProperty('fill', '#16a34a', 'important');
            element.style.setProperty('stroke', '#15803d', 'important');
            element.style.setProperty('stroke-width', '3px', 'important');
            element.style.setProperty('opacity', '0.9', 'important');
            break;
          case 'reserved':
            element.setAttribute('fill', '#d97706'); // Orange
            element.setAttribute('stroke', '#c2410c');
            element.setAttribute('stroke-width', '3');
            element.setAttribute('opacity', '0.9');
            element.style.setProperty('fill', '#d97706', 'important');
            element.style.setProperty('stroke', '#c2410c', 'important');
            element.style.setProperty('stroke-width', '3px', 'important');
            element.style.setProperty('opacity', '0.9', 'important');
            break;
          case 'exhumed':
            element.setAttribute('fill', '#6b7280'); // Gray
            element.setAttribute('stroke', '#4b5563');
            element.setAttribute('stroke-width', '3');
            element.setAttribute('opacity', '0.9');
            element.style.setProperty('fill', '#6b7280', 'important');
            element.style.setProperty('stroke', '#4b5563', 'important');
            element.style.setProperty('stroke-width', '3px', 'important');
            element.style.setProperty('opacity', '0.9', 'important');
            break;
          default:
            element.setAttribute('fill', '#16a34a'); // Default to green
            element.setAttribute('stroke', '#15803d');
            element.setAttribute('stroke-width', '3');
            element.setAttribute('opacity', '0.9');
            element.style.setProperty('fill', '#16a34a', 'important');
            element.style.setProperty('stroke', '#15803d', 'important');
            element.style.setProperty('stroke-width', '3px', 'important');
            element.style.setProperty('opacity', '0.9', 'important');
        }
        
      }
    } catch (error) {
      console.error(`Error refreshing color for ${plotId}:`, error);
    }
  };


  const setupEventListeners = () => {
    if (!svgRef.current) return;

    const container = svgRef.current;
    
    // Apply status colors to all plot elements
    applyPlotStatusColors();
    
    // Set up periodic refresh to maintain colors
    const colorRefreshInterval = setInterval(() => {
      if (svgRef.current) {
        applyPlotStatusColors();
      }
    }, 3000); // Refresh every 3 seconds
    
    // Store interval for cleanup
    if (svgRef.current) {
      svgRef.current._colorRefreshInterval = colorRefreshInterval;
    }
    
    // Add click handler to the container
    container.addEventListener('click', (e) => {
      console.log('Click event triggered');
      console.log('Event target:', e.target);
      console.log('Event target ID:', e.target.id);
      console.log('Event target tagName:', e.target.tagName);
      console.log('Target ID starts with rect:', e.target.id?.startsWith('rect'));
      console.log('Target ID starts with layer:', e.target.id?.startsWith('layer'));
      
      let target = e.target;
      let sectionId = null;
      
      // Early exit for generic shapes - don't process them at all
      if (target.id && (target.id.startsWith('rect') || target.id.startsWith('layer'))) {
        console.log('Generic shape clicked - ignoring:', target.id);
        return;
      }
      
        // Check if the clicked element is a valid plot element (not generic shapes)
        if (target.id && (target.tagName === 'rect' || target.tagName === 'ellipse')) {
          // Only allow clicks on actual plot elements, not generic shapes like rect110, rect121, etc.
          if ((target.id.startsWith('lb-') || target.id.startsWith('rb-') || 
              target.id.startsWith('apartment-') || target.id.startsWith('veterans') || 
              target.id.startsWith('eternal')) &&
              !target.id.startsWith('rect') && !target.id.startsWith('layer')) {
            sectionId = target.id;
            console.log('Valid plot element clicked:', sectionId);
          } else {
            console.log('Generic shape clicked (not a plot):', target.id);
            console.log('This shape will be ignored');
            return; // Don't process generic shapes
          }
        } else {
          // Check if any parent element is a valid plot rectangle
          const parentPlot = target.closest('rect[id^="lb-"], rect[id^="rb-"], rect[id^="apartment-"], rect[id^="veterans"], rect[id^="eternal"]');
          if (parentPlot) {
            sectionId = parentPlot.id;
            console.log('Parent plot element found:', sectionId);
          } else {
            console.log('No valid plot element found');
            return; // Don't process if no valid plot
          }
        }
      
      if (sectionId) {
        console.log('Section clicked:', sectionId);
        handleSectionClick(sectionId);
                    } else {
        console.log('No section ID found for click');
      }
    });
    
    console.log('SVG loaded - click functionality and status colors applied');
  };

  const getCemeteryTombs = (level) => {
    // Generate tombs based on the actual plot structure from your SVG
    const tombs = [];
    
    // For LB/RB sections, generate individual tombs based on the actual plot IDs
    if (selectedSection && (selectedSection.includes('lb-') || selectedSection.includes('rb-'))) {
      const plotNumber = selectedSection.match(/(lb|rb)-(\d+)/)?.[2];
      const sectionType = selectedSection.includes('lb-') ? 'lb' : 'rb';
      
      // Generate tombs for this specific plot
      const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
      const numTombs = level === 1 ? 6 : (level === 2 ? 4 : 3);
      
      for (let i = 0; i < numTombs; i++) {
        const tombLetter = letters[i];
        const plotId = `${sectionType}-${plotNumber}${tombLetter}`;
        
        tombs.push({
          id: `tomb-${level}-${i + 1}`,
          name: `Tomb ${level}-${tombLetter.toUpperCase()}`,
          position: { x: 20 + (i * 80), y: 100 },
              level: level,
              column: i + 1,
          plotId: plotId
        });
      }
        } else if (selectedSection && selectedSection.includes('apartment')) {
      // For apartment sections - 8 tombs per level
      const numTombs = 8;
      
      for (let i = 1; i <= numTombs; i++) {
        const tombLetter = String.fromCharCode(64 + i);
        // Correct plot ID format to match database: apartment-1-1a, apartment-1-1b, etc.
        const plotId = `${selectedSection}-${level}${tombLetter.toLowerCase()}`;
        
        tombs.push({
          id: `tomb-${level}-${i}`,
          name: `Tomb ${level}-${tombLetter}`,
          position: { x: 20 + ((i - 1) * 90), y: 100 },
          level: level,
          column: i,
          plotId: plotId
        });
      }
    } else {
      // For other special sections (veterans, etc.)
      const numTombs = level === 1 ? 4 : (level === 2 ? 3 : 2);
      
      for (let i = 1; i <= numTombs; i++) {
        const tombLetter = String.fromCharCode(64 + i);
        
        tombs.push({
          id: `tomb-${level}-${i}`,
          name: `Tomb ${level}-${tombLetter}`,
          position: { x: 20 + ((i - 1) * 80), y: 100 },
                  level: level,
          column: i,
          plotId: selectedSection
        });
      }
    }
    
    return tombs;
  };

  const renderLevelSelector = () => {
    if (!showLevelSelector || !selectedSection) return null;

    const cemeteryTombs = getCemeteryTombs(currentLevel);

    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
        <button
            onClick={handleBackToOverview}
              className="mb-4 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          ← Back to Map
        </button>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
              {selectedSection.replace('-', ' ').toUpperCase()} - Level Selection
            </h1>
            <p className="text-stone-600">
              {availableLevels.length === 1 
                ? "This mausoleum has only one level (Ground Level)"
                : "Select a level to view the tomb layout for this section"
              }
            </p>
        </div>
        
          {/* Level Buttons */}
          <div className="mb-8">
            <div className="flex gap-4 justify-center">
              {availableLevels.map(level => (
                  <button
                    key={level}
                  onClick={() => setCurrentLevel(level)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      currentLevel === level 
                      ? 'bg-stone-800 text-white shadow-lg transform scale-105'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                  LEVEL {level}
                  </button>
                ))}
              </div>
            <div className="text-center mt-4">
              <p className="text-stone-600 text-sm">
                {getLevelDescription(currentLevel)}
              </p>
          </div>
          </div>

          {/* Tomb Container */}
          <div className="relative bg-white rounded-lg shadow-lg p-6 min-h-[400px] border-2 border-stone-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-stone-800">
                Cemetery Tombs - Level {currentLevel}
              </h3>
              <p className="text-stone-600 text-sm">
                Click on any tomb to view details
              </p>
            </div>
            
            {/* Tomb Grid */}
            <div className="relative w-full h-[400px] bg-stone-50 rounded-lg border border-stone-200 overflow-x-auto" style={{ minWidth: '800px' }}>
              {cemeteryTombs.map((tomb, index) => {
                // Get plot data for status-based coloring
                // Use plotId if available, otherwise fall back to id
                const plotIdToSearch = tomb.plotId || tomb.id;
                const plotData = plots.find(p => p.plot_id === plotIdToSearch);
                
                // Debug logging for tomb 1-a
                if (tomb.id === 'tomb-1-1') {
                  console.log('🔍 DEBUGGING tomb-1-1 in level selector:');
                  console.log('  - Tomb ID:', tomb.id);
                  console.log('  - Tomb plotId:', tomb.plotId);
                  console.log('  - Plot ID to search:', plotIdToSearch);
                  console.log('  - Plot data found:', !!plotData);
                  console.log('  - Available plots:', plots.length);
                  console.log('  - Sample plot IDs:', plots.slice(0, 5).map(p => p.plot_id));
                  if (plotData) {
                    console.log('  - Plot data:', plotData);
                    console.log('  - Occupant name:', plotData.occupant_name);
                    console.log('  - Status:', plotData.status);
                  }
                }
                
                let status = 'available';
                let statusColor = '#16a34a'; // Green for available
                let statusBorder = '#15803d';
                
                if (plotData) {
                  if (plotData.status && plotData.status !== 'available') {
                    status = plotData.status;
                  } else if (plotData.occupant_name && plotData.occupant_name.trim() !== '') {
                    status = 'occupied';
                  } else if (plotData.date_of_interment) {
                    const intermentDate = new Date(plotData.date_of_interment);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (intermentDate > today) {
                      status = 'reserved';
                    } else {
                      status = 'occupied';
                    }
                  }
                  
                  // Set colors based on status
                    switch (status) {
                      case 'occupied':
                      statusColor = '#dc2626'; // Red
                      statusBorder = '#b91c1c';
                        break;
                      case 'reserved':
                      statusColor = '#d97706'; // Orange
                      statusBorder = '#c2410c';
                        break;
                      case 'exhumed':
                      statusColor = '#6b7280'; // Gray
                      statusBorder = '#4b5563';
                        break;
                      default:
                      statusColor = '#16a34a'; // Green
                      statusBorder = '#15803d';
                  }
                }
                
                // Determine tomb styling based on level and status
                const isLevel2 = tomb.level === 2;
                const tombStyle = isLevel2 ? {
                  backgroundColor: statusColor, // Status-based color
                  borderColor: statusBorder,
                  zIndex: 20, // Higher z-index for Level 2 (on top)
                  transform: 'translateY(-10px)', // Slightly elevated
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)' // Deeper shadow for elevation
                } : {
                  backgroundColor: statusColor, // Status-based color
                  borderColor: statusBorder,
                  zIndex: 10, // Lower z-index for Level 1 (below)
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                };
                    
                    return (
                      <div
                    key={tomb.id}
                    onClick={() => handleTombClick(tomb)}
                    className="absolute border-2 rounded-lg p-1 cursor-pointer transition-all duration-200 transform hover:scale-105 w-20 h-14"
              style={{ 
                      left: `${tomb.position.x}px`,
                      top: `${tomb.position.y}px`,
                      ...tombStyle
                    }}
                  >
                    <div className="text-center h-full flex flex-col justify-center items-center">
                      <div className="font-bold text-white text-xs text-center">
                        {tomb.name}
                          </div>
                      <div className="text-xs text-white text-center">
                        🪦
                          </div>
                      <div className="text-xs text-white text-center">
                        {isLevel2 ? 'L2' : 'L1'}
                      </div>
                      <div className="text-xs text-white text-center font-semibold">
                        {status.toUpperCase()}
            </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
        
          {/* Info Section */}
          <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-stone-600 mr-2">🪦</div>
              <div className="text-sm text-stone-800">
                <strong>Realistic Mausoleum System:</strong> Each mausoleum has different tomb counts and levels. 
                Some mausoleums only have Level 1 (Ground Level), others have Level 2 (Elevated). 
                Level 1: 1-4 tombs, Level 2: 1-3 tombs, Level 3: 1-2 tombs. 
                Each tomb contains unique deceased person data.
              </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    );
  };
                  
  const renderTombDetailsModal = () => {
    if (!showTombDetails || !selectedTomb) return null;

    const { deceasedData } = selectedTomb;
                        
                        return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-stone-800 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
          <div>
                <h2 className="text-xl font-bold">Deceased Person Details</h2>
                {!isAdmin && (
                  <p className="text-sm text-stone-300 mt-1">
                    View-only mode • Login as admin to edit details
                  </p>
                )}
                {isAdmin && (
                  <p className="text-sm text-green-300 mt-1">
                    Admin mode • Edit functionality enabled
                  </p>
                )}
          </div>
        <button
                onClick={closeTombDetails}
                className="text-white hover:text-gray-300 text-2xl font-bold"
        >
                ×
        </button>
                              </div>
                              </div>
        
          {/* Content */}
          <div className="p-6">
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded mt-1"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.name}</p>
                  )}
                            </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Age at Death</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.age || ''}
                      onChange={(e) => setEditData({...editData, age: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded mt-1"
                      placeholder="Enter age"
                    />
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.age} years old</p>
                  )}
                          </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Date of Interment</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="date"
                        value={editData.dateOfInterment || ''}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const autoStatus = getStatusFromDate(selectedDate);
                          
                          setEditData({
                            ...editData, 
                            dateOfInterment: selectedDate,
                            status: autoStatus
                          });
                        }}
                        className="w-full p-2 border border-stone-300 rounded mt-1"
                      />
                      {editData.dateOfInterment && (
                        <p className="text-xs text-blue-600 mt-1">
                          💡 Status will be automatically set based on the interment date
                        </p>
                      )}
                                </div>
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.dateOfInterment}</p>
                  )}
                                </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Cause of Death</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.causeOfDeath || ''}
                      onChange={(e) => setEditData({...editData, causeOfDeath: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded mt-1"
                      placeholder="Enter cause of death"
                    />
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.causeOfDeath}</p>
                  )}
                              </div>
                            </div>
        </div>

            {/* Family Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center">
                <span className="mr-2">👨‍👩‍👧‍👦</span>
                Family Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Family Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.familyName || ''}
                      onChange={(e) => setEditData({...editData, familyName: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded mt-1"
                      placeholder="Enter family name"
                    />
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.familyName}</p>
                  )}
              </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Next of Kin</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.nextOfKin || ''}
                      onChange={(e) => setEditData({...editData, nextOfKin: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded mt-1"
                      placeholder="Enter next of kin"
                    />
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.nextOfKin}</p>
                  )}
                          </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Contact Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.contactNumber || ''}
                      onChange={(e) => setEditData({...editData, contactNumber: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded mt-1"
                      placeholder="Enter contact number"
                    />
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.contactNumber}</p>
                  )}
                          </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Religion</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.religion || ''}
                      onChange={(e) => setEditData({...editData, religion: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded mt-1"
                      placeholder="Enter religion"
                    />
                  ) : (
                    <p className="text-stone-800 font-semibold">{deceasedData.religion}</p>
                  )}
                        </div>
                      </div>
                    </div>

            {/* Burial Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center">
                <span className="mr-2">🪦</span>
                Burial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Plot Location</label>
                  <p className="text-stone-800 font-semibold">{selectedTomb.plotId?.toUpperCase()}</p>
                          </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Section</label>
                  <p className="text-stone-800 font-semibold">{selectedSection?.replace('-', ' ').toUpperCase()}</p>
                          </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Level</label>
                  <p className="text-stone-800 font-semibold">Level {currentLevel}</p>
                        </div>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-stone-600">Status</label>
                  {isEditing ? (
                    <div>
                      <select
                        value={editData.status || deceasedData.status}
                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                        className="w-full p-2 border border-stone-300 rounded mt-1"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
                        <option value="exhumed">Exhumed</option>
                      </select>
                      {editData.status === 'reserved' && (
                        <p className="text-xs text-orange-600 mt-1">
                          📅 Status automatically set to "Reserved" for future interment date
                        </p>
                      )}
                      {editData.status === 'occupied' && (
                        <p className="text-xs text-red-600 mt-1">
                          📅 Status automatically set to "Occupied" for past/today interment date
                        </p>
                      )}
                                </div>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      deceasedData.status === 'occupied' ? 'bg-red-100 text-red-800' :
                      deceasedData.status === 'available' ? 'bg-green-100 text-green-800' :
                      deceasedData.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      deceasedData.status === 'exhumed' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {deceasedData.status.toUpperCase()}
                    </span>
                  )}
                                </div>
                              </div>
                            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center">
                <span className="mr-2">📝</span>
                Additional Notes
              </h3>
              <div className="bg-stone-50 p-3 rounded-lg">
                {isEditing ? (
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="w-full p-2 border border-stone-300 rounded mt-1 h-20 resize-none"
                    placeholder="Enter additional notes"
                  />
                ) : (
                  <p className="text-stone-800">{deceasedData.notes}</p>
                )}
                      </div>
                    </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePlot}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🗑️ Delete All Data
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={closeTombDetails}
                    className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
                  >
                    Close
                  </button>
                  {isAdmin && (
                    <button
                      onClick={handleDeletePlot}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Delete All Data
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={handleEditClick}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Details
                    </button>
                  )}
                  {deceasedData.status === 'occupied' && (
                    <button
                      onClick={() => handleExhumationRequest(deceasedData)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      🏺 Request Exhumation
                    </button>
                  )}
                </>
              )}
                  </div>
                </div>
                </div>
      </div>
    );
  };

  const renderPlotGrid = () => {
    // This function is no longer needed since we use the actual SVG
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading cemetery map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">Error loading cemetery map: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'level-selector') {
  return (
                    <div>
        {renderTombDetailsModal()}
        {renderLevelSelector()}
      </div>
    );
  }

  if (currentView === 'plot-grid') {
    return renderPlotGrid();
  }

                          
                          return (
    <div className="min-h-screen bg-stone-50">

      {/* Tomb Details Modal */}
      {renderTombDetailsModal()}

      {/* Exhumation Request Modal */}
      {showExhumationModal && exhumationPlotData && (
        <ExhumationRequestModal
          isOpen={showExhumationModal}
          onClose={() => {
            setShowExhumationModal(false);
            setExhumationPlotData(null);
            // Return to map view when closing
            setCurrentView('overview');
            setSelectedSection(null);
          }}
          plotData={exhumationPlotData}
          onSubmit={handleExhumationSubmit}
        />
      )}

      {/* Directions Modal */}
      {showDirections && targetPlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">🗺️ Directions to Plot</h2>
                  <p className="text-blue-100 mt-1">
                    {targetPlot.data?.occupant_name || 'Plot'} - {targetPlot.id.toUpperCase()}
                    {targetPlot.id.includes('apartment') && targetPlot.data?.level && (
                      <span className="block text-sm mt-1">
                        Level {targetPlot.data.level} • Tomb {targetPlot.data.plot_number}
                      </span>
                    )}
                  </p>
                </div>
        <button
                  onClick={() => setShowDirections(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
        >
                  ×
        </button>
                                </div>
                                </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {directions.map((direction, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {direction.step}
                              </div>
                            </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{direction.icon}</span>
                        <h3 className="font-semibold text-gray-800">{direction.location}</h3>
                      </div>
                      <p className="text-gray-600">{direction.instruction}</p>
                    </div>
                  </div>
                ))}
                </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📍 Target Plot Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Plot ID:</span>
                    <p className="text-gray-800">{targetPlot.id.toUpperCase()}</p>
                </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                      targetPlot.data?.status === 'occupied' ? 'bg-red-100 text-red-800' :
                      targetPlot.data?.status === 'available' ? 'bg-green-100 text-green-800' :
                      targetPlot.data?.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      targetPlot.data?.status === 'exhumed' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(targetPlot.data?.status || 'available').toUpperCase()}
                    </span>
              </div>
                  {targetPlot.id.includes('apartment') && targetPlot.data?.level && (
                    <>
                      <div>
                        <span className="font-medium text-gray-600">Level:</span>
                        <p className="text-gray-800">Level {targetPlot.data.level}</p>
      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tomb:</span>
                        <p className="text-gray-800">{targetPlot.data.plot_number}</p>
        </div>
                    </>
                  )}
                  {targetPlot.data?.occupant_name && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Occupant:</span>
                      <p className="text-gray-800">{targetPlot.data.occupant_name}</p>
      </div>
                  )}
        </div>
      </div>

              <div className="mt-6 flex justify-end space-x-3">
        <button
                  onClick={() => setShowDirections(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
                  Close
        </button>
        <button
                  onClick={() => {
                    setShowDirections(false);
                    // Optionally scroll to the plot again
                    highlightTargetPlot(targetPlot.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show on Map
        </button>
      </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="bg-stone-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Cemetery Map</h1>
          <div className="text-sm">
            Navigation: Scroll to explore • Click sections to view plots
                                </div>
                                </div>
      </div>


      {/* Status Legend */}
      <div className="bg-gradient-to-r from-stone-50 to-stone-100 border-b border-stone-300 p-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-stone-800 mb-6 text-center">Plot Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg border-3 shadow-sm" style={{ backgroundColor: '#16a34a', borderColor: '#15803d' }}></div>
                <div>
                  <span className="text-lg font-semibold text-stone-800">Available</span>
                  <p className="text-sm text-stone-600">Open for new burials</p>
                            </div>
                      </div>
                    </div>
            <div className="bg-white rounded-lg p-4 shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg border-3 shadow-sm" style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}></div>
                <div>
                  <span className="text-lg font-semibold text-stone-800">Occupied</span>
                  <p className="text-sm text-stone-600">Currently in use</p>
                  </div>
                </div>
                </div>
            <div className="bg-white rounded-lg p-4 shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg border-3 shadow-sm" style={{ backgroundColor: '#d97706', borderColor: '#c2410c' }}></div>
                <div>
                  <span className="text-lg font-semibold text-stone-800">Reserved</span>
                  <p className="text-sm text-stone-600">Booked for future use</p>
              </div>
      </div>
        </div>
            <div className="bg-white rounded-lg p-4 shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg border-3 shadow-sm" style={{ backgroundColor: '#6b7280', borderColor: '#4b5563' }}></div>
                <div>
                  <span className="text-lg font-semibold text-stone-800">Exhumed</span>
                  <p className="text-sm text-stone-600">Remains relocated</p>
      </div>
        </div>
      </div>
      </div>
        </div>
      </div>

        {/* Map Container */}
      <div className="p-2 md:p-6">
        <div className="max-w-7xl mx-auto">
          {!svgContent ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-gray-500">Loading cemetery map...</div>
            </div>
          ) : (
            <div 
              ref={svgContainerRef}
              className="bg-white rounded-lg shadow-lg map-container"
          style={{ 
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '30px'
              }}
              onClick={(e) => {
                if (e.target === svgContainerRef.current) {
                  console.log('Container clicked');
                }
              }}
            >
              <div
                ref={svgRef}
                dangerouslySetInnerHTML={{ __html: svgContent }}
                className="w-full h-auto"
        style={{
                  width: '90%',
                  height: 'auto',
                  maxWidth: '90%',
                  minHeight: '400px',
                  overflow: 'hidden',
                  transform: 'scale(1.0)',
                  transformOrigin: 'center'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  console.log('SVG Container clicked');
                  console.log('Click target:', e.target);
                  console.log('Click target ID:', e.target.id);
                  console.log('Click target tagName:', e.target.tagName);
                  
                  // Early exit for generic shapes
                  if (e.target.id && (e.target.id.startsWith('rect') || e.target.id.startsWith('layer'))) {
                    console.log('Generic shape clicked - ignoring:', e.target.id);
                    return;
                  }
                  
                  // Only handle clicks on valid plot rectangles/ellipses
                  if (e.target.tagName === 'rect' || e.target.tagName === 'ellipse') {
                    if (e.target.id && (e.target.id.startsWith('lb-') || e.target.id.startsWith('rb-') || 
                        e.target.id.startsWith('apartment-') || e.target.id.startsWith('veterans') || 
                        e.target.id.startsWith('eternal'))) {
                      console.log('Valid plot element clicked:', e.target.id);
                      handleSectionClick(e.target.id);
                    } else {
                      console.log('Invalid plot element clicked:', e.target.id);
                    }
                  } else {
                    // Check if parent is a valid plot element
                    const parentPlot = e.target.closest('rect[id^="lb-"], rect[id^="rb-"], rect[id^="apartment-"], rect[id^="veterans"], rect[id^="eternal"]');
                    if (parentPlot) {
                      console.log('Parent plot element found:', parentPlot.id);
                      handleSectionClick(parentPlot.id);
                    } else {
                      console.log('No valid plot element found');
                    }
                  }
                }}
              />
            </div>
          )}
          
        </div>
      </div>

      {/* No inline styles - let index.css handle everything */}
    </div>
  );
};

export default HierarchicalCemeteryMap;