import api from './api';

export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getMessages = async (userId: string) => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

export const sendMessage = async (messageData: { receiverId: string; content: string }) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};
