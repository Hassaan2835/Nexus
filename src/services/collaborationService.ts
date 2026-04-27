import api from './api';

export const createRequest = async (requestData: { entrepreneurId: string; message: string }) => {
  const response = await api.post('/collaboration/request', requestData);
  return response.data;
};

export const getRequests = async () => {
  const response = await api.get('/collaboration/requests');
  return response.data;
};

export const updateRequestStatus = async (id: string, status: 'accepted' | 'rejected') => {
  const response = await api.put(`/collaboration/requests/${id}`, { status });
  return response.data;
};
