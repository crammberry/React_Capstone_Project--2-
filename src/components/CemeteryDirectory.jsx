import React, { useState, useEffect } from 'react';

const CemeteryDirectory = ({ onClose, onNavigateToSection }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Restart animation when section changes
  useEffect(() => {
    if (selectedSection) {
      setAnimationKey(prev => prev + 1);
    }
  }, [selectedSection]);

  // Animated Arrow Component
  const AnimatedArrow = ({ direction, delay = 0, isActive = false, key }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      if (isActive) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    }, [isActive, delay, key]);

    const getArrowIcon = () => {
      switch (direction) {
        case 'straight': return '⬆️';
        case 'left': return '⬅️';
        case 'right': return '➡️';
        case 'continue': return '➡️';
        default: return '➡️';
      }
    };

    return (
      <div className={`flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full text-white text-2xl transition-all duration-500 transform ${
        isVisible ? 'scale-110 opacity-100' : 'scale-75 opacity-0'
      } ${isActive ? 'animate-pulse' : ''}`}>
        {getArrowIcon()}
      </div>
    );
  };

  // Get path steps for each section
  const getPathSteps = (sectionId) => {
    switch (sectionId) {
      case 'left-block':
        return [
          { direction: 'straight', text: 'Walk straight from entrance', delay: 0 },
          { direction: 'left', text: 'Turn left to Left Block', delay: 1000 }
        ];
      case 'right-block':
        return [
          { direction: 'straight', text: 'Walk straight from entrance', delay: 0 },
          { direction: 'right', text: 'Turn right to Right Block', delay: 1000 }
        ];
      case 'apartment-1':
        return [
          { direction: 'straight', text: 'Walk straight from entrance', delay: 0 },
          { direction: 'left', text: 'Turn left from left block', delay: 1000 },
          { direction: 'continue', text: 'Continue straight to Apartment 1', delay: 2000 }
        ];
      case 'apartment-2nd-level':
        return [
          { direction: 'straight', text: 'Walk straight from entrance', delay: 0 },
          { direction: 'left', text: 'Turn left from left block', delay: 1000 },
          { direction: 'continue', text: 'Continue straight to Apartment 2nd Level', delay: 2000 }
        ];
      case 'apartment-5':
        return [
          { direction: 'straight', text: 'Walk straight from entrance', delay: 0 },
          { direction: 'right', text: 'Turn right to right block', delay: 1000 },
          { direction: 'continue', text: 'Continue straight to Apartment 5', delay: 2000 }
        ];
      case 'veterans':
        return [
          { direction: 'straight', text: 'Walk straight from entrance', delay: 0 },
          { direction: 'continue', text: 'Continue to Veterans section', delay: 1000 }
        ];
      default:
        return [];
    }
  };

  const cemeterySections = [
    {
      id: 'left-block',
      name: 'Left Block (LB)',
      description: 'Traditional ground-level plots',
      icon: '⬅️',
      color: 'bg-blue-500',
      path: 'From main entrance, walk straight ahead to the left side',
      levels: 'Ground level only',
      totalPlots: '50+ plots available'
    },
    {
      id: 'right-block', 
      name: 'Right Block (RB)',
      description: 'Traditional ground-level plots',
      icon: '➡️',
      color: 'bg-green-500',
      path: 'From main entrance, walk straight ahead to the right side',
      levels: 'Ground level only',
      totalPlots: '50+ plots available'
    },
    {
      id: 'apartment-1',
      name: 'Apartment 1',
      description: 'Multi-level mausoleum building',
      icon: '🏢',
      color: 'bg-purple-500',
      path: 'From main entrance, take left from left block, continue straight',
      levels: '3 levels (Level 1, 2, 3)',
      totalPlots: '24 tombs (8 per level)'
    },
    {
      id: 'apartment-2nd-level',
      name: 'Apartment 2nd Level',
      description: 'Multi-level mausoleum building',
      icon: '🏢',
      color: 'bg-orange-500',
      path: 'From main entrance, take left from left block, continue straight',
      levels: '3 levels (Level 1, 2, 3)',
      totalPlots: '24 tombs (8 per level)'
    },
    {
      id: 'apartment-5',
      name: 'Apartment 5',
      description: 'Multi-level mausoleum building',
      icon: '🏢',
      color: 'bg-red-500',
      path: 'From main entrance, take right turn to right block, continue straight',
      levels: '3 levels (Level 1, 2, 3)',
      totalPlots: '24 tombs (8 per level)'
    },
    {
      id: 'veterans',
      name: 'Veterans Section',
      description: 'Dedicated to military veterans',
      icon: '🎖️',
      color: 'bg-yellow-500',
      path: 'From main entrance, walk towards the veterans memorial area',
      levels: 'Ground level only',
      totalPlots: '20+ plots available'
    }
  ];

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleNavigateToSection = (sectionId) => {
    onNavigateToSection(sectionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">🗺️ Cemetery Directory</h2>
              <p className="text-blue-100 mt-2">Navigate to different sections of our memorial park</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Directory Content */}
        <div className="p-6">
          {!selectedSection ? (
            // Main Directory View
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Destination</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cemeterySections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => handleSectionClick(section)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${section.color} rounded-full flex items-center justify-center text-white text-2xl mr-4`}>
                        {section.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{section.name}</h4>
                        <p className="text-gray-600 text-sm">{section.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Levels:</strong> {section.levels}</p>
                      <p><strong>Capacity:</strong> {section.totalPlots}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <span className="text-blue-600 font-semibold">Click for details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Section Details View
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setSelectedSection(null)}
                  className="mr-4 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  ← Back to Directory
                </button>
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${selectedSection.color} rounded-full flex items-center justify-center text-white text-2xl mr-4`}>
                    {selectedSection.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedSection.name}</h3>
                    <p className="text-gray-600">{selectedSection.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Animated Navigation Path */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-blue-800">📍 Animated Path to {selectedSection.name}</h4>
                    <button
                      onClick={() => setAnimationKey(prev => prev + 1)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      <i className="fas fa-redo"></i>
                      Restart Animation
                    </button>
                  </div>
                  
                  {/* Entrance Point */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mr-4">
                      🚪
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Main Entrance</p>
                      <p className="text-sm text-gray-600">Start your journey here</p>
                    </div>
                  </div>

                  {/* Animated Path Steps */}
                  <div className="space-y-4">
                    {getPathSteps(selectedSection.id).map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex items-center mr-4">
                          <AnimatedArrow 
                            key={`${animationKey}-${index}`}
                            direction={step.direction} 
                            delay={step.delay}
                            isActive={true}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 font-medium">{step.text}</p>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                            <div 
                              key={`progress-${animationKey}-${index}`}
                              className="bg-blue-600 h-1 rounded-full transition-all duration-1000"
                              style={{
                                width: `${(index + 1) * 33}%`,
                                transitionDelay: `${step.delay}ms`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination */}
                  <div className="flex items-center mt-6 pt-4 border-t border-blue-200">
                    <div className={`w-12 h-12 ${selectedSection.color} rounded-full flex items-center justify-center text-white text-2xl mr-4`}>
                      {selectedSection.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{selectedSection.name}</p>
                      <p className="text-sm text-gray-600">You have arrived!</p>
                    </div>
                  </div>
                </div>

                {/* Section Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">ℹ️ Section Information</h4>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold text-gray-700">Levels Available:</span>
                      <p className="text-gray-600">{selectedSection.levels}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Total Capacity:</span>
                      <p className="text-gray-600">{selectedSection.totalPlots}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Plot Types:</span>
                      <p className="text-gray-600">
                        {selectedSection.id.includes('apartment') 
                          ? 'Multi-level tombs (A-H per level)' 
                          : 'Ground-level plots (A-F per row)'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={() => handleNavigateToSection(selectedSection.id)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  🗺️ Go to {selectedSection.name}
                </button>
                <button
                  onClick={() => setSelectedSection(null)}
                  className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-lg"
                >
                  Back to Directory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CemeteryDirectory;
