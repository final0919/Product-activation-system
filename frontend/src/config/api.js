// API配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://precious-dedication-production.up.railway.app';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/users/me`
  },
  PRODUCTS: `${API_BASE_URL}/api/products`,
  ACTIVATION_CODES: `${API_BASE_URL}/api/activation-codes`,
  USERS: {
    ACTIVATE_PRODUCT: `${API_BASE_URL}/api/users/activate-product`,
    ALL: `${API_BASE_URL}/api/users`,
    BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`
  }
};

export default API_BASE_URL;
