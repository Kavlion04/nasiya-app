import axios, { AxiosInstance } from 'axios';

const USER_API: AxiosInstance = axios.create({
  baseURL: 'https://nasiya.takedaservice.uz/api',
});

USER_API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchBalances = async () => {
  const response = await USER_API.get('/balances');
  return response.data;
};

export const fetchDebts = async () => {
  const response = await USER_API.get('/debts');
  return response.data;
};

export const fetchProfile = async () => {
  const response = await USER_API.get('/profile');
  return response.data;
};

export const fetchClients = async (skip: number, take: number) => {
  const response = await USER_API.get('/debtor', {
    params: { skip, take },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const createClient = async (clientData: any) => {
  const response = await USER_API.post('/debtor', clientData);
  return response.data;
};

export default USER_API; 