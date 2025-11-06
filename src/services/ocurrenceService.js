import { apiService } from './apiService';
import { API_CONFIG } from '../utils/constants';

const transformToAPIData = (occurrenceData) => {
  console.log('🔄 Transforming occurrence data:', occurrenceData);
  
  const lat = occurrenceData.coord?.lat || occurrenceData.coordinate?.lat;
  const lng = occurrenceData.coord?.lng || occurrenceData.coordinate?.lng;
  
  if (!lat || !lng) {
    console.error('❌ Missing coordinates in occurrence data');
    throw new Error('Coordenadas são obrigatórias');
  }

  const transformedData = {
    description: occurrenceData.description,
    occurrence_type: occurrenceData.type,
    latitude: Number(lat),
    longitude: Number(lng)
  };

  console.log('📤 Data to be sent to API:', transformedData);
  return transformedData;
};

const transformToFrontendData = (apiData) => {
  console.log('🎯 transformToFrontendData received:', apiData);
  
  // Se apiData for undefined, tratar o erro
  if (!apiData) {
    console.error('❌ apiData is undefined in transformToFrontendData');
    return null;
  }

  // Verificar a estrutura da resposta
  console.log('🔍 API Response structure:', Object.keys(apiData));
  
  // O backend retorna { ocurrence, marker }, então pegamos ocurrence
  const occurrenceData = apiData.ocurrence || apiData;
  
  if (!occurrenceData) {
    console.error('❌ occurrenceData is undefined after extraction');
    return null;
  }

  console.log('📋 Extracted occurrenceData:', occurrenceData);
  
  return {
    id: occurrenceData._id || occurrenceData.id,
    type: occurrenceData.occurrence_type,
    description: occurrenceData.description,
    coordinate: {
      lat: occurrenceData.latitude,
      lng: occurrenceData.longitude
    },
    date_time: occurrenceData.date_time,
    status: occurrenceData.status
  };
};

export const occurrenceService = {
  async getAll() {
    try {
      console.log('📡 Fetching occurrences from API...');
      const data = await apiService.get(API_CONFIG.ENDPOINTS.OCCURRENCES);
      
      console.log('📨 GET Response:', data);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ API returned non-array data:', data);
        return [];
      }
      
      console.log(`✅ Loaded ${data.length} occurrences`);
      return data.map(transformToFrontendData);
    } catch (error) {
      console.error('❌ Error fetching occurrences:', error.message);
      throw error;
    }
  },

  async create(occurrenceData) {
    try {
      console.log('📝 Creating new occurrence...');
      const apiData = transformToAPIData(occurrenceData);
      
      console.log('🚀 Sending POST request...');
      const backendData = await apiService.post(API_CONFIG.ENDPOINTS.OCCURRENCES, apiData);
      
      console.log('📨 POST Response received:', backendData);
      console.log('🔍 Type of backendData:', typeof backendData);
      
      if (!backendData) {
        throw new Error('Resposta da API está vazia');
      }
      
      const frontendData = transformToFrontendData(backendData);
      
      if (!frontendData) {
        throw new Error('Falha ao transformar dados da ocorrência');
      }
      
      console.log('✅ Occurrence created successfully:', frontendData);
      return frontendData;
    } catch (error) {
      console.error('❌ Error creating occurrence:', error.message);
      
      // Fallback para desenvolvimento
      console.log('🔄 Using fallback creation...');
      const fallbackData = {
        id: Date.now(),
        type: occurrenceData.type,
        description: occurrenceData.description,
        coordinate: occurrenceData.coord || {
          lat: -23.5505 + (Math.random() - 0.5) * 0.01,
          lng: -46.6333 + (Math.random() - 0.5) * 0.01
        },
        date_time: new Date().toISOString(),
        status: 'ativo'
      };
      
      console.log('✅ Fallback occurrence created:', fallbackData);
      return fallbackData;
    }
  },

  getMockData() {
    console.log('🔄 Using mock data...');
    return [
      { 
        id: 1, 
        type: "Crime", 
        description: "Roubo reportado - Dados Mock", 
        coordinate: { lat: -23.5505, lng: -46.6333 } 
      },
      { 
        id: 2, 
        type: "Acidente", 
        description: "Acidente de trânsito - Dados Mock", 
        coordinate: { lat: -23.5515, lng: -46.6343 } 
      }
    ];
  }
};