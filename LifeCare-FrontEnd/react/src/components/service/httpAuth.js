import axios from "axios";

const ROLE_KEYS = ["admin", "hospital", "user"];

/** The access token stored when whoever is signed in logged in. */
export function getAccessToken() {
  for (const key of ROLE_KEYS) {
    const raw = sessionStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (data?.access_token) return data.access_token;
    } catch {
      sessionStorage.removeItem(key);
    }
  }
  return null;
}

export function clearSession() {
  ROLE_KEYS.forEach((key) => sessionStorage.removeItem(key));
}

/**
 * The API rejects protected routes without a bearer token, so attach the one
 * we stored at login to every outgoing request. Installed once from index.js.
 */
export function installAuthInterceptors() {
  axios.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.headers?.Authorization) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // An expired or missing token means the session is over — clear it and
      // send the user back to the login page rather than showing a dead page.
      if (error?.response?.status === 401) {
        clearSession();
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
      return Promise.reject(error);
    }
  );
}
