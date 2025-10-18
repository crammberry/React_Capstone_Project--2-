import React, { createContext, useContext, useState } from 'react';

const ExhumationContext = createContext();

export const useExhumation = () => {
  const context = useContext(ExhumationContext);
  if (!context) {
    console.error('useExhumation must be used within an ExhumationProvider');
    return {
      exhumationRequests: [],
      selectedPlot: null,
      setSelectedPlot: () => {},
      showExhumationModal: false,
      setShowExhumationModal: () => {},
      addExhumationRequest: () => {},
      updateExhumationRequest: () => {},
      deleteExhumationRequest: () => {},
      getExhumationRequestsByStatus: () => [],
      getExhumationRequestsBySection: () => []
    };
  }
  return context;
};

export const ExhumationProvider = ({ children }) => {
  const [exhumationRequests, setExhumationRequests] = useState([
    {
      id: 1,
      plotId: 'left-pasilyo-1-level1-col1',
      section: 'left-pasilyo-1',
      level: 1,
      column: 1,
      row: 1,
      deceasedName: 'Juan Dela Cruz',
      dateOfDeath: '2020-03-15',
      nextOfKin: 'Maria Dela Cruz',
      contactNumber: '09123456789',
      reason: 'Family decision to relocate remains',
      status: 'pending', // pending, approved, rejected, completed
      requestDate: '2024-01-15',
      adminNotes: '',
      exhumationDate: null,
      exhumationTeam: '',
      documents: []
    },
    {
      id: 2,
      plotId: 'right-pasilyo-5-level2-col3',
      section: 'right-pasilyo-5',
      level: 2,
      column: 3,
      row: 1,
      deceasedName: 'Pedro Santos',
      dateOfDeath: '2019-08-22',
      nextOfKin: 'Ana Santos',
      contactNumber: '09876543210',
      reason: 'Cemetery expansion project',
      status: 'approved',
      requestDate: '2024-01-10',
      adminNotes: 'Approved for relocation to new section',
      exhumationDate: '2024-02-15',
      exhumationTeam: 'Team Alpha',
      documents: ['death_certificate.pdf', 'family_consent.pdf']
    }
  ]);

  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showExhumationModal, setShowExhumationModal] = useState(false);

  const addExhumationRequest = (request) => {
    const newRequest = {
      ...request,
      id: Date.now(),
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      adminNotes: '',
      exhumationDate: null,
      exhumationTeam: '',
      documents: []
    };
    setExhumationRequests(prev => [...prev, newRequest]);
  };

  const updateExhumationRequest = (id, updates) => {
    setExhumationRequests(prev =>
      prev.map(request =>
        request.id === id ? { ...request, ...updates } : request
      )
    );
  };

  const deleteExhumationRequest = (id) => {
    setExhumationRequests(prev => prev.filter(request => request.id !== id));
  };

  const getExhumationRequestsByStatus = (status) => {
    return exhumationRequests.filter(request => request.status === status);
  };

  const getExhumationRequestsBySection = (section) => {
    return exhumationRequests.filter(request => request.section === section);
  };

  const value = {
    exhumationRequests,
    selectedPlot,
    setSelectedPlot,
    showExhumationModal,
    setShowExhumationModal,
    addExhumationRequest,
    updateExhumationRequest,
    deleteExhumationRequest,
    getExhumationRequestsByStatus,
    getExhumationRequestsBySection
  };

  return (
    <ExhumationContext.Provider value={value}>
      {children}
    </ExhumationContext.Provider>
  );
};
