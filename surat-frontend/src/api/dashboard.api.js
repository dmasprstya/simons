import api from './axios';

export async function getDashboardData() {
  const response = await api.get('/dashboard');
  return response.data;
}

export async function getAdminDashboardData() {
  const response = await api.get('/dashboard/admin');
  return response.data;
}
