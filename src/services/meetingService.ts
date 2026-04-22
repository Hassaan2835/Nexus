import api from './api';

export const createMeeting = async (meetingData: any) => {
  const response = await api.post('/meetings', meetingData);
  return response.data;
};

export const getMeetings = async () => {
  const response = await api.get('/meetings');
  return response.data;
};

export const getMeetingById = async (id: string) => {
  const response = await api.get(`/meetings/${id}`);
  return response.data;
};

export const updateMeetingStatus = async (id: string, status: string) => {
  const response = await api.put(`/meetings/${id}/status`, { status });
  return response.data;
};

export const deleteMeeting = async (id: string) => {
  const response = await api.delete(`/meetings/${id}`);
  return response.data;
};
