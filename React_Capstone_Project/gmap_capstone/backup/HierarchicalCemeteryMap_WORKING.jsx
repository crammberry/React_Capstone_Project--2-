import React, { useState, useEffect, useRef } from 'react';
import { useExhumation } from '../contexts/ExhumationContext';
import { useAuth } from '../contexts/AuthContext';
// No database - using local data
import ExhumationRequestModal from './ExhumationRequestModal';
import { PlotModal } from './Modal';

const HierarchicalCemeteryMap = ({ searchTerm, onPlotClick, selectedGrave }) => {
  const { isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [selectedSection, setSelectedSection] = useState(null);
  const [plotGridData, setPlotGridData] = useState(null);
  const [svgContent, setSvgContent] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showPlotEditModal, setShowPlotEditModal] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const svgContainerRef = useRef(null);
  const apartmentScrollRef = useRef(null);
  const [apartmentScrollX, setApartmentScrollX] = useState(0);
  const [alleyScrollY, setAlleyScrollY] = useState(0);
  const [isAlleyHovered, setIsAlleyHovered] = useState(false);
  const alleyScrollRef = useRef(null);
  
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
  
  // Function to get plot color based on status
  const getPlotColor = (status) => {
    switch (status) {
      case 'available':
        return '#10B981'; // Green
      case 'occupied':
        return '#EF4444'; // Red
      case 'reserved':
        return '#F59E0B'; // Yellow
      default:
        return '#6B7280'; // Gray
    }
  };

  // Apartment scroll functions
  const handleApartmentScrollLeft = () => {
    if (apartmentScrollRef.current) {
      const newScrollX = Math.max(0, apartmentScrollX - 200);
      setApartmentScrollX(newScrollX);
      apartmentScrollRef.current.scrollLeft = newScrollX;
    }
  };

  const handleApartmentScrollRight = () => {
    if (apartmentScrollRef.current) {
      const newScrollX = apartmentScrollX + 200;
      setApartmentScrollX(newScrollX);
      apartmentScrollRef.current.scrollLeft = newScrollX;
    }
  };

  // Alley scroll functions
  const handleAlleyScrollUp = () => {
    if (alleyScrollRef.current) {
      const newScrollY = Math.max(0, alleyScrollY - 100);
      setAlleyScrollY(newScrollY);
      alleyScrollRef.current.scrollTop = newScrollY;
    }
  };

  const handleAlleyScrollDown = () => {
    if (alleyScrollRef.current) {
      const newScrollY = alleyScrollY + 100;
      setAlleyScrollY(newScrollY);
      alleyScrollRef.current.scrollTop = newScrollY;
    }
  };

  // Handle mouse wheel scrolling for alleys
  const handleAlleyWheel = (e) => {
    if (isAlleyHovered) {
      e.preventDefault();
      if (e.deltaY > 0) {
        handleAlleyScrollDown();
      } else {
        handleAlleyScrollUp();
      }
    }
  };

  // Handle plot editing
  const handlePlotEdit = (plot) => {
    console.log('Editing plot:', plot);
    
    // Map section names from map to PlotModal section values
    const getSectionValue = (sectionName) => {
      const sectionMap = {
        'left-pasilyo': 'left-side-pasilyo',
        'right-pasilyo': 'right-side-pasilyo', 
        'left-block': 'left-block',
        'right-block': 'right-block',
        'apartment': 'apartment',
        'fetus-crematorium': 'fetus-and-crematory'
      };
      return sectionMap[sectionName] || sectionName;
    };
    
    // Prepare plot data for the PlotModal
    const plotData = {
      id: plot.id,
      name: plot.name || '',
      plot: plot.plot || '',
      section: getSectionValue(plot.section || selectedSection),
      dateOfInterment: plot.dateOfInterment || '',
      status: plot.status || 'available',
      notes: plot.notes || ''
    };
    
    setEditingPlot(plotData);
    setShowPlotEditModal(true);
  };

  // Handle plot status update
  const handlePlotStatusUpdate = async (plotId, newStatus, occupantName = '', dateOfInterment = '') => {
    try {
      await updatePlot(plotId, {
        status: newStatus,
        name: occupantName,
        dateOfInterment
      });
      setShowPlotEditModal(false);
      setEditingPlot(null);
    } catch (error) {
      console.error('Error updating plot:', error);
      alert('Error updating plot. Please try again.');
    }
  };

  // Handle section click
  const handleSectionClick = (sectionName) => {
    console.log('Section clicked:', sectionName);
    setSelectedSection(sectionName);
    setCurrentView('section');
    setCurrentLevel(1);
  };

  // Handle plot click
  const handlePlotClick = (plot) => {
    console.log('Plot clicked:', plot);
    if (isAdmin) {
      handlePlotEdit(plot);
    } else {
      // For guest users, show plot info or request exhumation
      console.log('Guest clicked plot:', plot);
    }
  };

  // Handle back to overview
  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedSection(null);
    setCurrentLevel(1);
  };

  // Handle level change
  const handleLevelChange = (level) => {
    setCurrentLevel(level);
  };

  // Handle zoom functions
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Load custom SVG
  useEffect(() => {
    const loadCustomSVG = async () => {
      try {
        const response = await fetch('/cemetery-map.svg');
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
          console.log('Custom Inkscape SVG loaded successfully');
        } else {
          console.log('Custom SVG not found, using fallback');
        }
      } catch (error) {
        console.log('Error loading custom SVG:', error);
      }
    };

    loadCustomSVG();
  }, []);

  // Setup event listeners for clickable sections
  const setupEventListeners = () => {
    console.log('Setting up event listeners...');
    console.log('svgContent:', !!svgContent);
    console.log('svgContainerRef.current:', !!svgContainerRef.current);
    
    if (!svgContent || !svgContainerRef.current) {
      console.log('Missing svgContent or container ref');
      return;
    }

    const svgElement = svgContainerRef.current.querySelector('svg');
    console.log('svgElement found:', !!svgElement);
    if (!svgElement) return;

    // First, remove any existing event listeners to prevent duplicates
    const existingElements = svgElement.querySelectorAll('[id]');
    existingElements.forEach(element => {
      element.replaceWith(element.cloneNode(true));
    });

    // Only look for specific clickable section IDs
    const clickableIds = [
      'left-pasilyo-1', 'left-pasilyo-2', 'left-pasilyo-3', 'left-pasilyo-4', 'left-pasilyo-5',
      'left-pasilyo-6', 'left-pasilyo-7', 'left-pasilyo-8', 'left-pasilyo-9', 'left-pasilyo-10',
      'left-pasilyo-11', 'left-pasilyo-12', 'left-pasilyo-13', 'left-pasilyo-14', 'left-pasilyo-15',
      'left-pasilyo-16', 'left-pasilyo-17', 'left-pasilyo-18', 'left-pasilyo-19', 'left-pasilyo-20',
      'left-pasilyo-21', 'left-pasilyo-22', 'left-pasilyo-23', 'left-pasilyo-24', 'left-pasilyo-25',
      'left-pasilyo-26', 'left-pasilyo-27', 'left-pasilyo-28', 'left-pasilyo-28a', 'left-pasilyo-28b',
      'right-pasilyo-1', 'right-pasilyo-2', 'right-pasilyo-3', 'right-pasilyo-4', 'right-pasilyo-5',
      'right-pasilyo-6', 'right-pasilyo-7', 'right-pasilyo-8', 'right-pasilyo-9', 'right-pasilyo-10',
      'right-pasilyo-11', 'right-pasilyo-12', 'right-pasilyo-13', 'right-pasilyo-14', 'right-pasilyo-15',
      'right-pasilyo-16', 'right-pasilyo-17', 'right-pasilyo-18', 'right-pasilyo-19', 'right-pasilyo-20',
      'right-pasilyo-21', 'right-pasilyo-22', 'right-pasilyo-23', 'right-pasilyo-24', 'right-pasilyo-25',
      'right-pasilyo-26', 'right-pasilyo-27', 'right-pasilyo-28', 'right-pasilyo-28a', 'right-pasilyo-28b',
      'right-pasilyo-29', 'right-pasilyo-30', 'right-pasilyo-31', 'right-pasilyo-32', 'right-pasilyo-33',
      'left-block-1', 'left-block-2', 'left-block-3', 'left-block-4', 'left-block-5',
      'left-block-6', 'left-block-7', 'left-block-8', 'left-block-9', 'left-block-10',
      'left-block-11', 'left-block-12', 'left-block-13', 'left-block-14', 'left-block-15',
      'left-block-16', 'left-block-17', 'left-block-18', 'left-block-19', 'left-block-20',
      'left-block-21', 'left-block-22', 'left-block-23', 'left-block-24', 'left-block-25',
      'right-block-1', 'right-block-2', 'right-block-3', 'right-block-4', 'right-block-5',
      'right-block-6', 'right-block-7', 'right-block-8', 'right-block-9', 'right-block-10',
      'right-block-11', 'right-block-12', 'right-block-13', 'right-block-14', 'right-block-15',
      'right-block-16', 'right-block-17', 'right-block-18', 'right-block-19', 'right-block-20',
      'right-block-21', 'right-block-22', 'right-block-23', 'right-block-24', 'right-block-25',
      'apartment-1', 'apartment-2', 'apartment-3', 'apartment-4', 'apartment-5',
      'apartment-1a', 'apartment-1b', 'apartment-1c', 'apartment-1d', 'apartment-1e',
      'apartment-1-a', 'apartment-1-b', 'apartment-1-c', 'apartment-1-d', 'apartment-1-e',
      'apartment-2a', 'apartment-2b', 'apartment-2c', 'apartment-2d', 'apartment-2e',
      'apartment-2-a', 'apartment-2-b', 'apartment-2-c', 'apartment-2-d', 'apartment-2-e',
      'apartment-3a', 'apartment-3b', 'apartment-3c', 'apartment-3d', 'apartment-3e',
      'apartment-3-a', 'apartment-3-b', 'apartment-3-c', 'apartment-3-d', 'apartment-3-e',
      'apartment-4a', 'apartment-4b', 'apartment-4c', 'apartment-4d', 'apartment-4e',
      'apartment-4-a', 'apartment-4-b', 'apartment-4-c', 'apartment-4-d', 'apartment-4-e',
      'apartment-5a', 'apartment-5b', 'apartment-5c', 'apartment-5d', 'apartment-5e',
      'apartment-5-a', 'apartment-5-b', 'apartment-5-c', 'apartment-5-d', 'apartment-5-e',
      'fetus-crematorium'
    ];

    clickableIds.forEach(id => {
      const element = svgElement.querySelector(`#${id}`);
      if (element) {
        console.log(`Found clickable element: ${id}`);
        element.style.cursor = 'pointer';
        
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log(`Clicked: ${id}`);
          handleSectionClick(id);
        });

        element.addEventListener('mouseenter', () => {
          element.style.filter = 'brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';
        });

        element.addEventListener('mouseleave', () => {
          element.style.filter = '';
        });
      }
    });

    // Also look for any elements with apartment in the ID (dynamic search)
    const apartmentElements = svgElement.querySelectorAll('[id*="apartment"]');
    apartmentElements.forEach(element => {
      if (!element.hasAttribute('data-listener-added')) {
        element.style.cursor = 'pointer';
        element.setAttribute('data-listener-added', 'true');
        
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log(`Clicked apartment: ${element.id}`);
          handleSectionClick(element.id);
        });

        element.addEventListener('mouseenter', () => {
          element.style.filter = 'brightness(1.2) drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';
        });

        element.addEventListener('mouseleave', () => {
          element.style.filter = '';
        });
      }
    });

    console.log('Event listeners setup complete');
  };

  // Setup event listeners when SVG content changes
  useEffect(() => {
    if (svgContent && svgContainerRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(setupEventListeners, 100);
    }
  }, [svgContent, zoom]);

  // Generate plot grid data for the selected section
  useEffect(() => {
    if (!selectedSection) {
      setPlotGridData(null);
      return;
    }

    const generatePlotGrid = () => {
      const plots = [];
      const plotWidth = 80;
      const plotHeight = 100;
      const plotSpacing = 20;

      // Get the section element to determine its type
      const svgElement = svgContainerRef.current?.querySelector('svg');
      const sectionElement = svgElement?.querySelector(`#${selectedSection}`);
      
      if (!sectionElement) return [];

      const isAlley = selectedSection.includes('alley');
      const isApartment = selectedSection.includes('apartment');
      const isFetusCrematorium = selectedSection.includes('fetus-crematorium');

      if (isAlley) {
        // Alley sections: 4 columns x 10 rows (40 plots total)
        const plotsPerRow = 4;
        const numRows = 10;
        const startX = 300; // Centered position
        const startY = 200; // Top margin
        
        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < plotsPerRow; col++) {
            const plotIndex = row * plotsPerRow + col + 1;
            plots.push({
              id: `${selectedSection}-alley-${plotIndex}`,
              level: 1,
              column: col + 1,
              row: row + 1,
              plotNumber: `A${plotIndex}`, // A1, A2, A3, ..., A40
              status: 'available',
              position: {
                x: startX + col * (plotWidth + plotSpacing),
                y: startY + row * (plotHeight + 25), // 25px row spacing
                width: 60, // Smaller width to fit
                height: 60  // Smaller height to fit
              }
            });
          }
        }
      } else if (isFetusCrematorium) {
        // Fetus-crematorium: Perfect rectangle layout with T1-T13 top, R1-R6 right, R7-R12 left
        const plotSize = 30;
        const spacing = 20;
        const marginX = 200;
        const marginY = 120;
        
        // Top row plots (T1-T13)
        for (let i = 0; i < 13; i++) {
          plots.push({
            id: `${selectedSection}-top-${i + 1}`,
            level: 1,
            column: i + 1,
            row: 1,
            plotNumber: `T${i + 1}`, // T1, T2, T3, ..., T13
            status: 'available',
            position: {
              x: marginX + i * (plotSize + spacing),
              y: marginY,
              width: plotSize,
              height: plotSize
            }
          });
        }
        
        // Right side plots (R1-R6 down right edge starting under T13)
        for (let i = 0; i < 6; i++) {
          plots.push({
            id: `${selectedSection}-right-${i + 1}`,
            level: 1,
            column: 13,
            row: i + 2,
            plotNumber: `R${i + 1}`, // R1, R2, R3, ..., R6 for right side
            status: 'available',
            position: {
              x: marginX + 12 * (plotSize + spacing), // Same x as T13
              y: marginY + plotSize + spacing + i * (plotSize + spacing),
              width: plotSize,
              height: plotSize
            }
          });
        }
        
        // Left side plots (R7-R12 down left edge starting under T1)
        for (let i = 0; i < 6; i++) {
          plots.push({
            id: `${selectedSection}-left-${i + 1}`,
            level: 1,
            column: 1,
            row: i + 2,
            plotNumber: `R${i + 7}`, // R7, R8, R9, etc. for left side
            status: 'available',
            position: {
              x: marginX, // Same x as T1
              y: marginY + plotSize + spacing + i * (plotSize + spacing),
              width: plotSize,
              height: plotSize
            }
          });
        }
      } else if (isApartment) {
        // Apartment sections: 25 plots per level (A1-A25) with 5 levels - horizontal layout
        const plotsPerLevel = 25; // 25 plots per level
        const numLevels = 5;
        const plotX = 50; // Start from left with some margin
        const baseY = 200; // Starting Y position
        
        for (let level = 1; level <= numLevels; level++) {
          for (let i = 0; i < plotsPerLevel; i++) {
            plots.push({
              id: `${selectedSection}-level${level}-plot${i + 1}`,
              level: level,
              column: i + 1,
              row: 1,
              plotNumber: `A${i + 1}`, // A1, A2, A3, ..., A25 for each level
              status: 'available', // Will be updated with real data
              position: {
                x: plotX + i * (plotWidth + plotSpacing),
                y: baseY + (level - 1) * (plotHeight + plotSpacing),
                width: plotWidth,
                height: plotHeight
              }
            });
          }
        }
      } else {
        // Regular sections: 8-column grid with levels
        const numColumns = 8;
        
        // Calculate centered starting position for 8 columns
        const totalWidth = numColumns * plotWidth + (numColumns - 1) * plotSpacing;
        const startX = (1200 - totalWidth) / 2;
        const baseY = 300; // Fixed starting Y position
        
        // Create ONE ROW of plots for each level (proper vertical stacking)
        // First determine which columns have plots at each level (no floating plots)
        const columnLevels = [];
        
        for (let col = 0; col < numColumns; col++) {
          const maxLevel = Math.floor(Math.random() * 3) + 1; // Random 1-3 levels for this column
          columnLevels[col] = maxLevel;
        }
        
        // Now create plots based on proper stacking
        for (let level = 1; level <= 3; level++) {
          for (let col = 0; col < numColumns; col++) {
            // Only create plot if this level exists for this column
            if (level <= columnLevels[col]) {
              plots.push({
                id: `${selectedSection}-level${level}-col${col + 1}`,
                level: level,
                column: col + 1,
                row: 1,
                plotNumber: `${String.fromCharCode(65 + col)}${level}`, // A1, B1, C1, etc.
                status: 'available',
                position: {
                  x: startX + col * (plotWidth + plotSpacing),
                  y: baseY + (level - 1) * (plotHeight + plotSpacing),
                  width: plotWidth,
                  height: plotHeight
                }
              });
            }
          }
        }
      }

      return plots;
    };

    const gridData = generatePlotGrid();
    setPlotGridData(gridData);
  }, [selectedSection]);

  // Update plot statuses with real data
  useEffect(() => {
    if (plotGridData && selectedSection) {
      const sectionPlots = getPlotsBySection(selectedSection);
      const updatedGridData = plotGridData.map(plot => {
        // Find matching plot in real data
        const realPlot = sectionPlots.find(p => p.plot === plot.plotNumber);
        if (realPlot) {
          return {
            ...plot,
            status: realPlot.status,
            occupantName: realPlot.name,
            dateOfInterment: realPlot.dateOfInterment,
            notes: realPlot.notes
          };
        }
        return plot;
      });
      setPlotGridData(updatedGridData);
    }
  }, [selectedSection, getPlotsBySection]);

  // Render plot grid
  const renderPlotGrid = () => {
    if (!plotGridData || plotGridData.length === 0) return null;

    const isAlley = selectedSection?.includes('alley');
    const isApartment = selectedSection?.includes('apartment');
    const isFetusCrematorium = selectedSection?.includes('fetus-crematorium');

    return (
      <div className="relative">
        {/* Alley scroll container */}
        {isAlley && (
          <div 
            ref={alleyScrollRef}
            className="overflow-hidden"
            style={{ 
              height: '600px',
              overflowY: 'scroll'
            }}
            onMouseEnter={() => setIsAlleyHovered(true)}
            onMouseLeave={() => setIsAlleyHovered(false)}
            onWheel={handleAlleyWheel}
          >
            <div style={{ height: '800px' }}>
              {plotGridData.map((plot) => (
                <div key={plot.id}>
                  {/* Plot rectangle */}
                  <div
                    className="absolute border-2 border-gray-800 cursor-pointer hover:border-blue-500 transition-colors"
                    style={{
                      left: `${plot.position.x}px`,
                      top: `${plot.position.y}px`,
                      width: `${plot.position.width}px`,
                      height: `${plot.position.height}px`,
                      backgroundColor: getPlotColor(plot.status),
                      opacity: 0.8
                    }}
                    onClick={() => handlePlotClick(plot)}
                    title={`Plot ${plot.plotNumber} - ${plot.status}`}
                  />
                  
                  {/* Plot number label */}
                  <text
                    x={plot.position.x + plot.position.width / 2}
                    y={plot.position.y - 20}
                    textAnchor="middle"
                    className="fill-black font-bold pointer-events-none"
                    style={{ fontSize: '10px' }}
                  >
                    {plot.plotNumber}
                  </text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apartment scroll container */}
        {isApartment && (
          <div className="relative">
            {/* Scroll buttons */}
            <div className="flex justify-between mb-4">
              <button
                onClick={handleApartmentScrollLeft}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={apartmentScrollX <= 0}
              >
                ← Scroll Left
              </button>
              <button
                onClick={handleApartmentScrollRight}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Scroll Right →
              </button>
            </div>
            
            <div 
              ref={apartmentScrollRef}
              className="overflow-x-auto"
              style={{ 
                width: '100%',
                height: '400px'
              }}
            >
              <div 
                style={{ 
                  width: '2000px',
                  height: '400px',
                  transform: `translateX(-${apartmentScrollX}px)`,
                  transition: 'transform 0.3s ease'
                }}
              >
                {plotGridData.map((plot) => (
                  <div key={plot.id}>
                    {/* Plot rectangle */}
                    <div
                      className="absolute border-2 border-gray-800 cursor-pointer hover:border-blue-500 transition-colors"
                      style={{
                        left: `${plot.position.x}px`,
                        top: `${plot.position.y}px`,
                        width: `${plot.position.width}px`,
                        height: `${plot.position.height}px`,
                        backgroundColor: getPlotColor(plot.status),
                        opacity: 0.8
                      }}
                      onClick={() => handlePlotClick(plot)}
                      title={`Plot ${plot.plotNumber} - ${plot.status}`}
                    />
                    
                    {/* Plot number label */}
                    <text
                      x={plot.position.x + plot.position.width / 2}
                      y={plot.position.y - 10}
                      textAnchor="middle"
                      className="fill-black font-bold pointer-events-none"
                      style={{ fontSize: '12px' }}
                    >
                      {plot.plotNumber}
                    </text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regular and Fetus-Crematorium sections */}
        {!isAlley && !isApartment && (
          <div className="relative" style={{ height: '600px' }}>
            {plotGridData.map((plot) => (
              <div key={plot.id}>
                {/* Plot rectangle */}
                <div
                  className="absolute border-2 border-gray-800 cursor-pointer hover:border-blue-500 transition-colors"
                  style={{
                    left: `${plot.position.x}px`,
                    top: `${plot.position.y}px`,
                    width: `${plot.position.width}px`,
                    height: `${plot.position.height}px`,
                    backgroundColor: getPlotColor(plot.status),
                    opacity: 0.8
                  }}
                  onClick={() => {
                    if (isFetusCrematorium) {
                      console.log('Fetus-crematorium plot clicked - no function yet');
                    } else {
                      handlePlotClick(plot);
                    }
                  }}
                  title={`Plot ${plot.plotNumber} - ${plot.status}`}
                />
                
                {/* Plot number label */}
                <text
                  x={plot.position.x + plot.position.width / 2}
                  y={isFetusCrematorium ? plot.position.y - 6 : plot.position.y - 10}
                  textAnchor="middle"
                  className="fill-black font-bold pointer-events-none"
                  style={{ fontSize: isFetusCrematorium ? '8.5px' : '12px' }}
                >
                  {plot.plotNumber}
                </text>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render section info
  const renderSectionInfo = () => {
    if (!selectedSection) return null;

    const sectionPlots = getPlotsBySection(selectedSection);
    const stats = {
      total: sectionPlots.length,
      available: sectionPlots.filter(p => p.status === 'available').length,
      occupied: sectionPlots.filter(p => p.status === 'occupied').length,
      reserved: sectionPlots.filter(p => p.status === 'reserved').length
    };

    const isFetusCrematorium = selectedSection?.includes('fetus-crematorium');

    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 mb-6 ${isFetusCrematorium ? 'absolute top-4 left-4 z-10' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedSection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <p className="text-gray-600">Section Overview</p>
          </div>
          <button
            onClick={handleBackToOverview}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ← Back to Map
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Plots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
            <div className="text-sm text-gray-600">Reserved</div>
          </div>
        </div>

        {/* Level selector for regular sections */}
        {!selectedSection.includes('alley') && !selectedSection.includes('apartment') && !selectedSection.includes('fetus-crematorium') && (
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-4 py-2 rounded ${
                  currentLevel === level 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        )}

        {/* Apartment level selector */}
        {selectedSection.includes('apartment') && (
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-4 py-2 rounded ${
                  currentLevel === level 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        )}
      </div>
    );
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Map</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Zoom Controls */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={handleZoomOut}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          -
        </button>
        <button
          onClick={handleResetZoom}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Reset ({zoom.toFixed(1)}x)
        </button>
        <button
          onClick={handleZoomIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          +
        </button>
      </div>

      {/* Map Container */}
      <div 
        className="relative border border-gray-300 rounded-lg overflow-hidden bg-white"
        style={{ zoom: zoom }}
      >
        {currentView === 'overview' && (
          <div 
            ref={svgContainerRef}
            className="w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {currentView === 'section' && (
          <div className="relative">
            {renderSectionInfo()}
            {renderPlotGrid()}
          </div>
        )}
      </div>

      {/* Plot Edit Modal */}
      {showPlotEditModal && editingPlot && (
        <PlotModal
          isOpen={showPlotEditModal}
          onClose={() => {
            setShowPlotEditModal(false);
            setEditingPlot(null);
          }}
          plotData={editingPlot}
          onSave={handlePlotStatusUpdate}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default HierarchicalCemeteryMap;



