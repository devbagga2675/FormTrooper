import axios from 'axios';

// Replace with your actual backend URL
const API_URL = 'http://localhost:8080/api'; 
const authToken = localStorage.getItem('authToken');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }
});

export const generateForm = (formData) => {
  return api.post('/forms/generate', formData);
};

export const getUserForms = () => {
  return api.get('/forms');
};

export const uploadDocument = (file, formId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('formId', formId);

  return axios.post(`${API_URL}/documents/upload`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  });
};

export const deleteForm = (formId) => {
  return api.delete(`/forms/${formId}`);
};

export const getFormById = (formId) => {
  return api.get(`/forms/${formId}`);
};

export const updateForm = (formId, formData) => {
  return api.put(`/forms/${formId}`, formData);
};

export const getFormResponses = (formId) => {
  return api.get(`/forms/${formId}/responses`);
};