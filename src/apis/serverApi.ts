import axios from 'axios';

const open = axios.create({
  baseURL: '/api/v1'
});

const secure = axios.create({
  baseURL: '/api/v1'
});

secure.interceptors.request.use(
  (_config) => {
    const config = { ..._config };
    const csrf = JSON.parse(localStorage.getItem('csrf')) || {};
    config.headers.Authorization = config.url.match(/^\/users\/auth\/refresh/)
      ? csrf.refresh
      : csrf.bearer;
    return config;
  },
  (e) => e
);

secure.interceptors.response.use(
  (res) => res,
  async (e) => {
    const original = e.config;
    if (e.response.status === 401 && !original._retry) {
      const {
        data: { csrf }
      } = await secure.get('/users/auth/refresh');
      original._retry = true;
      localStorage.setItem('csrf', JSON.stringify(csrf));
      original.headers.Authorization = csrf.bearer;
      return axios(original);
    }
    throw e;
  }
);
export default { open, secure };
