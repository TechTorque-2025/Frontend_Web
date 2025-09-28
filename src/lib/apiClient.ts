import axios, { AxiosInstance } from 'axios';

let API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

const createClient = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

let api = createClient(API_BASE);

export const setApiBaseUrl = (baseUrl: string) => {
  API_BASE = baseUrl;
  api = createClient(API_BASE);
};

export const getApiBaseUrl = () => API_BASE;

export default api;
