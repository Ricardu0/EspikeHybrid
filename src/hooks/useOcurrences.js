import { useState, useCallback } from 'react';
import { occurrenceService } from '../services/occurrenceService';
import { useApi } from './useApi';

// Hook específico para gerenciar ocorrências
export const useOccurrences = () => {
  const [occurrences, setOccurrences] = useState([]);
  
  // Buscar todas as ocorrências
  const { loading: loadingOccurrences, error: occurrencesError, execute: fetchOccurrences } = useApi(
    useCallback(async () => {
      const data = await occurrenceService.getAll();
      setOccurrences(data);
      return data;
    }, []),
    true // carrega automaticamente
  );

  // Criar nova ocorrência
  const { loading: creatingOccurrence, error: createError, execute: createOccurrence } = useApi(
    useCallback(async (occurrenceData) => {
      const newOccurrence = await occurrenceService.create(occurrenceData);
      setOccurrences(prev => [...prev, newOccurrence]);
      return newOccurrence;
    }, [])
  );

  // Atualizar ocorrência (atualização otimista)
  const updateOccurrence = useCallback(async (id, updatedData) => {
    const previousOccurrences = [...occurrences];
    
    // Atualização otimista
    setOccurrences(prev => 
      prev.map(occurrence => 
        occurrence.id === id ? { ...occurrence, ...updatedData } : occurrence
      )
    );

    try {
      const result = await occurrenceService.update(id, updatedData);
      return result;
    } catch (error) {
      // Revert em caso de erro
      setOccurrences(previousOccurrences);
      throw error;
    }
  }, [occurrences]);

  return {
    occurrences,
    loading: loadingOccurrences || creatingOccurrence,
    error: occurrencesError || createError,
    fetchOccurrences,
    createOccurrence,
    updateOccurrence,
    setOccurrences
  };
};