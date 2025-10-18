import React, { useState, useEffect } from 'react';
import DataService from '../services/DataService';

const SimpleMapTest = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, reserved: 0, exhumed: 0 });
  const [selectedSection, setSelectedSection] = useState(null);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [plotsData, statsData] = await Promise.all([
          DataService.getAllPlots(),
          DataService.getPlotStats()
        ]);
        
        setPlots(plotsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading test data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Get plots by section
  const getPlotsBySection = (sectionName) => {
    return plots.filter(plot => plot.section === sectionName);
  };

  const testSections = [
    'left-pasilyo-1',
    'right-pasilyo-1', 
    'left-block-1',
    'right-block-1',
    'apartment-1',
    'fetus-crematorium'
  ];

  const handleSectionClick = (section) => {
    console.log('Testing section:', section);
    const sectionPlots = getPlotsBySection(section);
    console.log('Section plots found:', sectionPlots.length);
    setSelectedSection(section);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading database...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Database Stats:</h2>
        <p>Total Plots: {stats.total}</p>
        <p>Available: {stats.available}</p>
        <p>Occupied: {stats.occupied}</p>
        <p>Reserved: {stats.reserved}</p>
        <p>Exhumed: {stats.exhumed}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Section Clicks:</h2>
        <div className="grid grid-cols-3 gap-2">
          {testSections.map(section => (
            <button
              key={section}
              onClick={() => handleSectionClick(section)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {selectedSection && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Section: {selectedSection}</h3>
          <p>Plots found: {getPlotsBySection(selectedSection).length}</p>
          <div className="mt-4 max-h-60 overflow-y-auto">
            {getPlotsBySection(selectedSection).map(plot => (
              <div key={plot.id} className="p-2 border rounded mb-1">
                <strong>{plot.plot_number}</strong> - Level {plot.level} - {plot.status}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">All Plots (first 10):</h3>
        <div className="max-h-60 overflow-y-auto">
          {plots.slice(0, 10).map(plot => (
            <div key={plot.id} className="p-2 border rounded mb-1">
              <strong>{plot.section}</strong> - {plot.plot_number} - Level {plot.level} - {plot.status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleMapTest;



