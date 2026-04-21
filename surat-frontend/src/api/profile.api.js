import api from './axios';

export const getProfile     = ()           => api.get('/profile');
export const updateProfile  = (data)       => {
  if (data.photo) {
    const form = new FormData();
    form.append('_method', 'PUT');
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) form.append(key, val);
    });
    return api.post('/profile', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put('/profile', data);
};
export const changePassword = (data)       => api.post('/profile/change-password', data);
export const uploadPhoto    = (file)       => {
  const form = new FormData();
  form.append('photo', file);
  return api.post('/profile/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deletePhoto    = ()           => api.delete('/profile/photo');
