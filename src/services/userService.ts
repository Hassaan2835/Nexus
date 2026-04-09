import api from './api';

export const getEntrepreneurs = async () => {
  const response = await api.get('/users/entrepreneurs');
  return response.data;
};

export const getInvestors = async () => {
  const response = await api.get('/users/investors');
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateProfile = async (id: string, userData: any) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};
