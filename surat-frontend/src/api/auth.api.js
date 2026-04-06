import api from './axios';

/**
 * Login — kirim email & password, terima token + user data
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

/**
 * Logout — revoke token di server
 */
export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

/**
 * Me — ambil data profil user yang sedang login
 */
export async function me() {
  const response = await api.get('/auth/me');
  return response.data;
}

/**
 * Change Password — ganti password user yang sedang login
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPassword,
  });
  return response.data;
}
