/** Where the FastAPI backend lives.
 *
 *  Every service module builds its URLs from this, so one variable moves the
 *  whole app between a local backend and a deployed one. Vite only exposes
 *  variables prefixed VITE_, and it reads them at build time — a change to
 *  .env needs the dev server restarted.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9091"
).replace(/\/+$/, "");
