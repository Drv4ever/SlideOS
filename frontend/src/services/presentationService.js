const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/presentations`;

// Helper for repetitive headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// 1. SAVE NEW
export const savePresentation = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to save presentation');
  return response.json();
};

// 2. GET MY LIST
export const getMyPresentations = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch presentations');
  return response.json();
};

// 3. GET ONE BY ID
export const getPresentationById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) throw new Error('Failed to fetch presentation details');
  return response.json();
};

export const updatePresentation = async (id, data) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to update presentation");
  return response.json();
};
