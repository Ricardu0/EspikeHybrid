import { API_CONFIG, REQUEST_TIMEOUT } from "../utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ApiService {
  constructor() {
    // Agora sim ele vai respeitar o localhost que está no constants.js!
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Pega o token salvo para você conseguir passar pelas rotas protegidas
    const token = await AsyncStorage.getItem("userToken");

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // Injeta o token se ele existir
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      timeout: REQUEST_TIMEOUT,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

const instance = new ApiService();

export const apiService = instance;
export const apiClient = instance;
