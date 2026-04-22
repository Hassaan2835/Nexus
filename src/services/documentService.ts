import api from './api';

export const uploadDocument = async (formData: FormData) => {
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const shareDocument = async (id: string, userId: string) => {
  const response = await api.put(`/documents/${id}/share`, { userId });
  return response.data;
};

export const signDocument = async (id: string, signatureData: string) => {
  const response = await api.put(`/documents/${id}/sign`, { signatureData });
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};
