import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/auth' });

export const registerUser = (data) => API.post('/register', data);
export const loginUser = (data) => API.post('/login', data);
export const forgotPassword = (data) => API.post('/forgot-password', data);
export const verifyOTP = (data) => API.post('/verify-otp', data);
export const resetPassword = (data) => API.post('/reset-password', data);
export const sendRegisterOTP = (data) => API.post('/send-register-otp', data);
export const googleLogin = (data) => API.post('/google', data);