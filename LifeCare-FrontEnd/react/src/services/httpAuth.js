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

/** Where each role lands after signing in. */
export const ROLE_HOME = {
  admin: "/admindashboard",
  hospital: "/hospitaldashboard",
  user: "/userdashboard",
};

/**
 * Store a successful login and report where to send the browser next.
 *
 * Both ways in — the password form and the Google callback — go through here,
 * so the session always looks the same whichever one was used. An unrecognised
 * role is treated as a patient, which is what the password form did before.
 */
export function storeSession(data) {
  const role = ROLE_KEYS.includes(data?.role) ? data.role : "user";
  // Drop any stale role first: signing in as one role must not leave the
  // previous role's session sitting alongside it.
  clearSession();
  sessionStorage.setItem(role, JSON.stringify({ ...data, role }));
  return ROLE_HOME[role];
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
