import { apiClient } from './apiService';

export const areaService = {
  // Buscar todas as áreas
  async getAll() {
    const response = await apiClient.get('/areas');
    return response.data;
  },

  // Criar nova área
  async create(areaData) {
    const response = await apiClient.post('/areas', areaData);
    return response.data;
  },

  // Avaliar área
  async rateArea(areaId, ratingData) {
    const response = await apiClient.post(`/areas/${areaId}/ratings`, ratingData);
    return response.data;
  },

  // Buscar áreas por localização
  async getByBounds(northEast, southWest) {
    const response = await apiClient.get(
      `/areas/in-bounds?neLat=${northEast.lat}&neLng=${northEast.lng}&swLat=${southWest.lat}&swLng=${southWest.lng}`
    );
    return response.data;
  }
};
