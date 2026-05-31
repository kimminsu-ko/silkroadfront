import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 5000,
    withCredentials: true,
});

api.interceptors.request.use(/* ... */);


const isAuthPage = () => {
    const p = window.location.pathname;
    return p.startsWith('/login') || p.startsWith('/signup');
};

let isRedirecting = false;


api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401) {
            localStorage.removeItem("accessToken");

            if (!isRedirecting && !isAuthPage()) {
                isRedirecting = true;
                const current = window.location.pathname + window.location.search;
                const reason = 'auth_required';

                window.location.replace(
                    `/login?redirect=${encodeURIComponent(current)}&reason=${reason}`
                );
            }

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;
