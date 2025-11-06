import { apiService } from './api';
import { API_CONFIG } from '../utils/constants';

// Transforma os dados do frontend para o formato da API
const transformToAPIData = (occurrenceData) => {
  return {
    description: occurrenceData.description,
    occurrence_type: occurrenceData.type, // Note: occurrence_type no backend, type no front
    latitude: occurrenceData.coord?.lat || occurrenceData.coordinate?.lat,
    longitude: occurrenceData.coord?.lng || occurrenceData.coordinate?.lng,
    date_time: new Date().toISOString(),
    status: 'ativo'
  };
};

// Transforma os dados da API para o formato do frontend
const transformToFrontendData = (apiData) => {
  return {
    id: apiData._id || apiData.id,
    type: apiData.occurrence_type,
    description: apiData.description,
    coordinate: {
      lat: apiData.latitude,
      lng: apiData.longitude
    },
    date_time: apiData.date_time,
    status: apiData.status
  };
};

export const occurrenceService = {
  // Buscar todas as occurrences
  async getAll() {
    try {
      const data = await apiService.get(API_CONFIG.ENDPOINTS.OCCURRENCES);
      return Array.isArray(data) ? data.map(transformToFrontendData) : [];
    } catch (error) {
      console.error('Error fetching occurrences:', error);
      throw error;
    }
  },

  // Buscar uma occurrence por ID
  async getById(id) {
    try {
      const data = await apiService.get(`${API_CONFIG.ENDPOINTS.OCCURRENCES}/${id}`);
      return transformToFrontendData(data);
    } catch (error) {
      console.error(`Error fetching occurrence ${id}:`, error);
      throw error;
    }
  },

  // Criar nova occurrence
  async create(occurrenceData) {
    try {
      const apiData = transformToAPIData(occurrenceData);
      const data = await apiService.post(API_CONFIG.ENDPOINTS.OCCURRENCES, apiData);
      return transformToFrontendData(data);
    } catch (error) {
      console.error('Error creating occurrence:', error);
      throw error;
    }
  },

  // Atualizar occurrence
  async update(id, occurrenceData) {
    try {
      const apiData = transformToAPIData(occurrenceData);
      const data = await apiService.put(`${API_CONFIG.ENDPOINTS.OCCURRENCES}/${id}`, apiData);
      return transformToFrontendData(data);
    } catch (error) {
      console.error(`Error updating occurrence ${id}:`, error);
      throw error;
    }
  },

  // Deletar occurrence
  async delete(id) {
    try {
      await apiService.delete(`${API_CONFIG.ENDPOINTS.OCCURRENCES}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting occurrence ${id}:`, error);
      throw error;
    }
  }
};