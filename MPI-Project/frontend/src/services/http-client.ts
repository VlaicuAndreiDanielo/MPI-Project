import axios from 'axios';

console.log("API:", import.meta.env.VITE_API_URL);

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});
