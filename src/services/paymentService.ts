import api from './api';

export const getWalletInfo = async () => {
  const response = await api.get('/payments/wallet');
  return response.data;
};

export const depositFunds = async (depositData: { amount: number; description?: string }) => {
  const response = await api.post('/payments/deposit', depositData);
  return response.data;
};

export const transferFunds = async (transferData: { amount: number; recipientId: string; description?: string; type?: string }) => {
  const response = await api.post('/payments/transfer', transferData);
  return response.data;
};
