import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.101.15:4040',
});

export default api;
