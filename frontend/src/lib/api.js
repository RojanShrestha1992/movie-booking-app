import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  profile: () => api.get('/auth/profile'),
};

export const movieApi = {
  all: () => api.get('/movies'),
  one: (id) => api.get(`/movies/${id}`),
  create: (payload) => api.post('/movies', payload),
  update: (id, payload) => api.put(`/movies/${id}`, payload),
  remove: (id) => api.delete(`/movies/${id}`),
};

export const showApi = {
  all: () => api.get('/shows'),
  byMovie: (movieId) => api.get(`/shows/movie/${movieId}`),
  one: (id) => api.get(`/shows/${id}`),
  create: (payload) => api.post('/shows', payload),
  update: (id, payload) => api.put(`/shows/${id}`, payload),
  remove: (id) => api.delete(`/shows/${id}`),
};

export const bookingApi = {
  create: (payload) => api.post('/bookings', payload),
  mine: () => api.get('/bookings/my'),
  one: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  all: () => api.get('/bookings'),
};

export const getErrorMessage = (error) => {
  if (error?.response?.data?.unavailableSeats?.length) {
    return `${error.response.data.message}: ${error.response.data.unavailableSeats.join(', ')}`;
  }
  return error?.response?.data?.message || 'Something went wrong. Please try again.';
};

export default api;
