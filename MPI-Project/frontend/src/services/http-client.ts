import axios from 'axios';

export const httpClient = axios.create({
  baseURL: "https://mpi-project.onrender.com",
  timeout: 10000,
});
