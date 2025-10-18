import React, { useState, useEffect, useRef } from 'react';
import DataService from '../services/DataService';

const PlotSelectionMap = ({ isOpen, onClose, onPlotSelected, currentPlotId }) => {
  const [svgContent, setSvgContent] = useState('');
  const [availablePlots, setAvailablePlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef(null);

  // Load SVG and available plots
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load SVG
      const response = await fetch('/cemetery-map.svg');
      const svgText = await response.text();
      setSvgContent(svgText);
      
      // Load ALL plots (not just available ones)
      const plots = await DataService.getAllPlots();
      setAvailablePlots(plots);
      
    } catch (error) {
      console.error('Error loading plot selection data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply colors when SVG and plots are loaded
  useEffect(() => {
    if (svgContent && availablePlots.length > 0 && svgRef.current) {
      console.log('🎨 PlotSelectionMap: Applying colors...');
      // Set a global flag to prevent main map interference
      window.plotSelectionMapActive = true;
      setTimeout(() => {
        applyPlotColors();
      }, 1000);
    }
  }, [svgContent, availablePlots]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlot(null);
    }
  }, [isOpen]);

  const applyPlotColors = () => {
    if (!svgRef.current) {
      console.log('❌ SVG ref not available');
      return;
    }

    console.log('🎨 PlotSelectionMap: Applying plot colors...');
    console.log('Available plots:', availablePlots.length);

    // Create a map for quick lookup
    const plotMap = new Map();
    availablePlots.forEach(plot => {
      plotMap.set(plot.plot_id, plot);
      plotMap.set(plot.plot_id.toLowerCase(), plot);
    });

    // Find all plot elements within this specific map
    const allPlots = svgRef.current.querySelectorAll('rect[id*="lb-"], rect[id*="rb-"], rect[id*="apartment-"], rect[id*="veterans"], rect[id*="eternal"]');
    console.log('PlotSelectionMap: Found plot elements:', allPlots.length);
    
    allPlots.forEach((element, index) => {
      const plotId = element.id;
      const plot = plotMap.get(plotId) || plotMap.get(plotId.toLowerCase());
      
      console.log(`Processing plot ${index + 1}/${allPlots.length}: ${plotId}`);
      
      if (plot) {
        // Determine status
        let status = 'available';
        let fillColor = '#10b981'; // Green for available
        let strokeColor = '#059669';
        let strokeWidth = '3';
        let opacity = '0.9';
        let cursor = 'pointer';
        
        // Check if this is the current plot being exhumed
        if (currentPlotId && plot.plot_id === currentPlotId) {
          status = 'current';
          fillColor = '#8b5cf6'; // Purple
          strokeColor = '#7c3aed';
          cursor = 'not-allowed';
        } else if (plot.status && plot.status !== 'available') {
          status = plot.status;
          switch (status) {
            case 'occupied':
              fillColor = '#dc2626'; // Red
              strokeColor = '#b91c1c';
              cursor = 'not-allowed';
              break;
            case 'reserved':
              fillColor = '#d97706'; // Orange
              strokeColor = '#c2410c';
              cursor = 'not-allowed';
              break;
            case 'exhumed':
              fillColor = '#6b7280'; // Gray
              strokeColor = '#4b5563';
              cursor = 'not-allowed';
              break;
          }
        } else if (plot.occupant_name && plot.occupant_name.trim() !== '') {
          status = 'occupied';
          fillColor = '#dc2626'; // Red
          strokeColor = '#b91c1c';
          cursor = 'not-allowed';
        } else if (plot.date_of_interment) {
          const intermentDate = new Date(plot.date_of_interment);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (intermentDate > today) {
            status = 'reserved';
            fillColor = '#d97706'; // Orange
            strokeColor = '#c2410c';
            cursor = 'not-allowed';
          } else {
            status = 'occupied';
            fillColor = '#dc2626'; // Red
            strokeColor = '#b91c1c';
            cursor = 'not-allowed';
          }
        }
        
        // Apply colors
        element.setAttribute('fill', fillColor);
        element.setAttribute('stroke', strokeColor);
        element.setAttribute('stroke-width', strokeWidth);
        element.setAttribute('opacity', opacity);
        element.style.cursor = cursor;
        
        // Force with !important
        element.style.setProperty('fill', fillColor, 'important');
        element.style.setProperty('stroke', strokeColor, 'important');
        element.style.setProperty('stroke-width', strokeWidth, 'important');
        element.style.setProperty('opacity', opacity, 'important');
        
        // Set data attributes
        element.setAttribute('data-status', status);
        element.setAttribute('data-plot-id', plotId);
        
        console.log(`Applied ${status} color to ${plotId}: ${fillColor}`);
        
        // Only add click handler for available plots
        if (status === 'available') {
          element.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('PlotSelectionMap: Available plot clicked:', plotId);
            handlePlotClick(plot);
          };
        } else {
          element.onclick = null;
        }
      } else {
        // Default styling for plots not in database
        element.setAttribute('fill', '#10b981'); // Green for available
        element.setAttribute('stroke', '#059669');
        element.setAttribute('stroke-width', '3');
        element.setAttribute('opacity', '0.9');
        element.style.cursor = 'pointer';
        
        // Force style application
        element.style.setProperty('fill', '#10b981', 'important');
        element.style.setProperty('stroke', '#059669', 'important');
        element.style.setProperty('stroke-width', '3px', 'important');
        element.style.setProperty('opacity', '0.9', 'important');
        
        element.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Available plot (no data) clicked:', plotId);
          handlePlotClick({ plot_id: plotId, section: 'unknown', level: 'unknown' });
        };
        
        console.log(`No data found for ${plotId}, set to available (green)`);
      }
    });

    // Highlight selected plot if any
    if (selectedPlot) {
      highlightSelectedPlot();
    }
    
    console.log('🎨 Color application complete!');
  };

  const highlightSelectedPlot = () => {
    if (selectedPlot && svgRef.current && selectedPlot.plot_id) {
      console.log('Highlighting selected plot:', selectedPlot.plot_id);
      const element = svgRef.current.querySelector(`rect[id="${selectedPlot.plot_id}"]`);
      if (element) {
        element.setAttribute('fill', '#3b82f6'); // Blue for selected
        element.setAttribute('stroke', '#1d4ed8');
        element.setAttribute('stroke-width', '4');
        element.setAttribute('opacity', '1');
        element.style.cursor = 'pointer';
        
        // Force style application
        element.style.setProperty('fill', '#3b82f6', 'important');
        element.style.setProperty('stroke', '#1d4ed8', 'important');
        element.style.setProperty('stroke-width', '4px', 'important');
        element.style.setProperty('opacity', '1', 'important');
        
        console.log(`Applied SELECTED color to ${selectedPlot.plot_id}`);
      }
    }
  };

  const handlePlotClick = (plot) => {
    console.log('Plot clicked by user:', plot);
    
    if (plot && plot.plot_id) {
      console.log('Setting selected plot to:', plot.plot_id);
      setSelectedPlot(plot);
      
      // Highlight the selected plot immediately
      highlightSelectedPlot();
    } else {
      console.log('Invalid plot data, ignoring click');
    }
  };

  const handleConfirmSelection = () => {
    if (selectedPlot) {
      console.log('PlotSelectionMap: Confirming selection:', selectedPlot.plot_id);
      // Clear the global flag
      window.plotSelectionMapActive = false;
      onPlotSelected(selectedPlot);
      onClose();
    }
  };

  const handleCancel = () => {
    console.log('PlotSelectionMap: Cancelling selection');
    setSelectedPlot(null);
    // Clear the global flag
    window.plotSelectionMapActive = false;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">📍 Select Destination Plot</h2>
              <p className="text-sm opacity-90">Choose where you want to relocate the remains.</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading cemetery map...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Available Plots ({availablePlots.filter(p => !p.occupant_name || p.occupant_name.trim() === '').length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Occupied Plots ({availablePlots.filter(p => p.occupant_name && p.occupant_name.trim() !== '').length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Reserved Plots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Selected Plot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Current Plot (Being Exhumed)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span>Exhumed Plots</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <div 
                  ref={svgRef}
                  className="w-full h-auto plot-selection-map"
                  style={{ minWidth: '800px' }}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </div>

              {/* Selected Plot Info */}
              {selectedPlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Selected Plot Details:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Plot ID:</span> {selectedPlot.plot_id.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Section:</span> {selectedPlot.section || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {selectedPlot.level || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> Available
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 -mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                console.log('🔧 Manual color application triggered');
                applyPlotColors();
              }}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
            >
              🔧 Turn On Colors
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedPlot}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPlot
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotSelectionMap;