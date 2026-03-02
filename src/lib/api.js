import axios from "axios";
import { tokenStore } from "../store/tokenStore.js";

/**
 * Base URL theo spec: /api
 * Set bằng .env: VITE_API_BASE_URL=http://localhost:3000/api
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

/** Gắn access token */
api.interceptors.request.use((config) => {
  const accessToken = tokenStore.getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

/** Nếu 401: thử refresh rồi retry request */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (!original) throw err;
    if (err.response?.status !== 401) throw err;

    // tránh loop vô hạn
    if (original.__isRetryRequest) throw err;
    original.__isRetryRequest = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      })
        .then(() => api(original))
        .catch((e) => Promise.reject(e));
    }

    isRefreshing = true;
    try {
      // Spec: POST /api/auth/refresh
      const refreshRes = await axios.post(
        (import.meta.env.VITE_API_URL || "http://localhost:4000/api") + "/auth/refresh",
        {},
        { withCredentials: true }
      );

      // Kỳ vọng BE trả: { success:true, data:{ accessToken } }
      const accessToken = refreshRes.data?.data?.accessToken || refreshRes.data?.accessToken;
      if (accessToken) tokenStore.setAccessToken(accessToken);

      queue.forEach((p) => p.resolve());
      queue = [];

      return api(original);
    } catch (e) {
      queue.forEach((p) => p.reject(e));
      queue = [];
      tokenStore.clear();
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

/** Helper unwrap theo spec {success, data, error} */
export function unwrap(res) {
  if (res?.data?.success === false) {
    const msg = res.data?.error?.message || "Request failed";
    const code = res.data?.error?.code;
    const details = res.data?.error?.details;
    const e = new Error(msg);
    e.code = code;
    e.details = details;
    throw e;
  }

  // Nếu có meta thì trả về object chứa cả data và meta
  if (res?.data?.meta) {
    return {
      data: res.data.data,
      meta: res.data.meta
    };
  }

  return res?.data?.data ?? res?.data;
}
