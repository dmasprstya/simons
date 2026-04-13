import api from './axios';

export const getProfile     = ()           => api.get('/profile');
export const updateProfile  = (data)       => api.put('/profile', data);
export const changePassword = (data)       => api.post('/profile/change-password', data);
export const uploadPhoto    = (base64)     => api.post('/profile/photo', { photo: base64 });
export const deletePhoto    = ()           => api.delete('/profile/photo');
