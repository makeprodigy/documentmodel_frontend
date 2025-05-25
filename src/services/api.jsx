import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    throw error.response?.data || { detail: 'An error occurred' };
  }
);

export const login = async (username, password) => {
  try {
    const response = await api.post('/token/', { username, password });
    localStorage.setItem('token', response.data.access);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/register/', { username, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadDocument = async (file, title) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    const response = await api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDocuments = async () => {
  try {
    const response = await api.get('/documents/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    await api.delete(`/documents/${documentId}/`);
  } catch (error) {
    throw error;
  }
};

export const getQuestions = async (documentId) => {
  try {
    const response = await api.get(`/questions/?document=${documentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const askQuestion = async (documentId, question) => {
  try {
    const response = await api.post('/questions/ask/', {
      document: documentId,
      question: question,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 