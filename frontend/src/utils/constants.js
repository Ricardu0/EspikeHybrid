export const API_CONFIG = {
  BASE_URL: "http://localhost:5174", // Raiz do seu servidor local
  ENDPOINTS: {
    OCCURRENCES: "/api/occurrences", // <--- Adicione o /api aqui!
    USERS: "/api/users",
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
};

export const REQUEST_TIMEOUT = 10000;
