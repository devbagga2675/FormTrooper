import axios from 'axios';

const API_URL = 'http://localhost:8080/api/analysis'; // Base URL for analysis
const authToken = localStorage.getItem('authToken');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }
});

export const analyzeFormResponses = (formId, actionText) => {
  // This now correctly calls POST /api/analysis/:formId
  return api.post(`/${formId}`, { action_text: actionText });
};