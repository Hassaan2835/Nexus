import api from './api';
import { User } from '../types';

export const loginUser = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgotpassword', { email });
  return response.data;
};

export const resetPassword = async (token: string, password: any) => {
  const response = await api.put(`/auth/resetpassword/${token}`, { password });
  return response.data;
};

export const updatePassword = async (passwordData: any) => {
  const response = await api.put('/auth/updatepassword', passwordData);
  return response.data;
};

export const toggle2fa = async () => {
  const response = await api.put('/auth/toggle2fa');
  return response.data;
};

export const verify2fa = async (verifyData: { email: string; code: string }) => {
  const response = await api.post('/auth/verify2fa', verifyData);
  return response.data;
};

export const updateDetails = async (details: any) => {
  const response = await api.put('/auth/updatedetails', details);
  return response.data;
};
