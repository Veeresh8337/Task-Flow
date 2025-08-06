// src/utils/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // ✅ Adjust if your backend URL is different
  withCredentials: true, // ✅ Send/receive cookies like accessToken
});

export default axiosInstance;
