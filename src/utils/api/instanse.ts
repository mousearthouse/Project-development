import axios from 'axios';

const API_URL = "http://95.182.120.75:8082/api/";

export const api = axios.create({
    baseURL: `${API_URL}`,
    headers: {},
});

api.interceptors.response.use(
    (response) => {
      console.log(response);
      return response;
    },
    (error) => {
      if (error.response.status === 500) {
        console.log(`Ошибка сервера:${error.response.data.message}`);
      }
      return Promise.reject(error);
    },
  );
  
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      try {
        const res = await fetch(`${API_URL}auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error('Refresh failed');
        const data = await res.json();

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);

        processQueue(null, data.accessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);