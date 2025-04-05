import axios, { AxiosInstance } from 'axios';

const LOGIN_API: AxiosInstance = axios.create({
  baseURL: 'https://nasiya.takedaservice.uz/api',
});

interface LoginCredentials {
  login: string;
  hashed_password: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await LOGIN_API.post('/auth/login', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default LOGIN_API; 