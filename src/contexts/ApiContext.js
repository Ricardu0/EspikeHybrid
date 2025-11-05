import React, { createContext, useContext } from 'react';
import { useOccurrences } from '../hooks/useOccurrences';
import { useAreas } from '../hooks/useAreas';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const occurrences = useOccurrences();
  const areas = useAreas();

  const value = {
    occurrences,
    areas,
    // Status consolidado
    loading: occurrences.loading || areas.loading,
    error: occurrences.error || areas.error
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};