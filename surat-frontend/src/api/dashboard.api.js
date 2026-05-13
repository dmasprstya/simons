import api from './axios';

export async function getDashboardData() {
  const response = await api.get('/dashboard');
  return response.data;
}

export async function getAdminDashboardData(params = {}) {
  const response = await api.get('/dashboard/admin', { params });
  return response.data;
}
