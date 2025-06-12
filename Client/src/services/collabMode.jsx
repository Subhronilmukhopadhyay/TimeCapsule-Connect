// src/services/collabMode.js
import api from './api';

export const fetchCollabMode = async (id) => {
  try {
    const response = await api.get(`/create/capsule/collab/${id}`);
    return response.data.collabMode === true;
  } catch (error) {
    console.error(`Error fetching collaboration mode for capsule ${id}:`, error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/create/capsule/collabName'); // endpoint that returns { name: "..." }
    return response.data; // { name: "John Doe" }
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};