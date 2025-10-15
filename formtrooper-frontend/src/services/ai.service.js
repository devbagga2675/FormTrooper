import axios from 'axios';

const API_URL = 'http://localhost:8080/api/ai'; // Note the '/ai' base path
const authToken = localStorage.getItem('authToken');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }
});

export const refineForm = (formId, instruction) => {
  // This will call our new backend endpoint
  return api.post(`/refine/${formId}`, { new_instruction: instruction });
};

export const analyzeFormResponses = (formId, actionText) => {
  // This calls the new backend endpoint we created
  return api.post(`/analysis/${formId}`, { action_text: actionText });
};

export const queryForm = (formId, query) => {
  return api.post(`/query/${formId}`, { user_query: query });
};