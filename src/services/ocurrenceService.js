import { apiClient } from './apiService';

export const occurrenceService = {
  // Buscar todas as ocorrências
  async getAll() {
    const response = await apiClient.get('/occurrences');
    return response.data;
  },

  // Buscar ocorrência por ID
  async getById(id) {
    const response = await apiClient.get(`/occurrences/${id}`);
    return response.data;
  },

  // Criar nova ocorrência
  async create(occurrenceData) {
    const response = await apiClient.post('/occurrences', occurrenceData);
    return response.data;
  },

  // Atualizar ocorrência
  async update(id, occurrenceData) {
    const response = await apiClient.put(`/occurrences/${id}`, occurrenceData);
    return response.data;
  },

  // Deletar ocorrência
  async delete(id) {
    const response = await apiClient.delete(`/occurrences/${id}`);
    return response.data;
  },

  // Buscar ocorrências por localização
  async getByLocation(lat, lng, radius) {
    const response = await apiClient.get(
      `/occurrences/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return response.data;
  }
};