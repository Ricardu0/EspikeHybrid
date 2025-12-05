import { useState, useEffect } from 'react';
import { occurrenceService } from '../services/ocurrenceService';

export const useOccurrences = () => {
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar occurrences ao inicializar
  useEffect(() => {
    loadOccurrences();
  }, []);

  const loadOccurrences = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await occurrenceService.getAll();
      setOccurrences(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load occurrences:', err);
    } finally {
      setLoading(false);
    }
  };

  const addOccurrence = async (occurrenceData) => {
    setLoading(true);
    setError(null);
    try {
      const newOccurrence = await occurrenceService.create(occurrenceData);
      setOccurrences(prev => [...prev, newOccurrence]);
      return newOccurrence;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOccurrence = async (id, occurrenceData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOccurrence = await occurrenceService.update(id, occurrenceData);
      setOccurrences(prev => 
        prev.map(occ => occ.id === id ? updatedOccurrence : occ)
      );
      return updatedOccurrence;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOccurrence = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await occurrenceService.delete(id);
      setOccurrences(prev => prev.filter(occ => occ.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    occurrences,
    loading,
    error,
    addOccurrence,
    updateOccurrence,
    deleteOccurrence,
    refreshOccurrences: loadOccurrences
  };
};