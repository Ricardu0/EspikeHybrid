import { apiClient } from './apiService';

export const areaService = {
  // Buscar todas as áreas (o apiClient retorna o JSON direto, sem .data)
  async getAll() {
    const result = await apiClient.get('/api/areas');
    return Array.isArray(result) ? result : [];
  },

  // Criar nova área (apenas admin/mod)
  async create(areaData) {
    return await apiClient.post('/api/areas', areaData);
  },

  // Avaliar área
  async rateArea(areaId, ratingData) {
    return await apiClient.post(`/api/areas/${areaId}/rate`, ratingData);
  },

  // Buscar relatos da área
  async getReports(areaId) {
    const result = await apiClient.get(`/api/areas/${areaId}/reports`);
    return Array.isArray(result) ? result : [];
  },

  // Adicionar relato
  async addReport(areaId, comment) {
    return await apiClient.post(`/api/areas/${areaId}/reports`, { comment });
  },

  // Votar em um relato (upvote/downvote)
  async voteOnReport(areaId, reportId, isUpvote) {
    return await apiClient.post(`/api/areas/${areaId}/reports/${reportId}/vote`, { isUpvote });
  },
};
