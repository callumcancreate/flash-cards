import axios from 'axios';

const open = axios.create({
  baseURL: '/api/v1',
});

const secure = axios.create({
  baseURL: '/api/v1',
});

export default { open, secure };
