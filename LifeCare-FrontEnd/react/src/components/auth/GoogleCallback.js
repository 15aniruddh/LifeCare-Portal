import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../assets/images/logo.png";
import { storeSession } from "../../services/httpAuth";

/**
 * Where the backend hands the browser back after Google sign-in.
 *
 * The session arrives in the URL *fragment* (`#access_token=…&role=…`), which
 * browsers never send to a server — so the token stays out of access logs and
 * out of the Referer header. We read it, store it, wipe it from the address
 * bar, and move on to the right dashboard.
 */
export default function GoogleCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  // StrictMode runs effects twice in development; the fragment is consumed on
  // the first pass, so guard against the second one reporting a false failure.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const failure = params.get("error");
    if (failure) {
      setError(failure);
      return;
    }

    const token = params.get("access_token");
    const id = params.get("id");
    const role = params.get("role");
    if (!token || !id || !role) {
      setError("That sign-in did not come back complete. Please try again.");
      return;
    }

    const destination = storeSession({
      id: Number(id),
      name: params.get("name") || "",
      role,
      access_token: token,
      token_type: params.get("token_type") || "bearer",
      expires_in: Number(params.get("expires_in")) || 0,
    });

    // Drop the token from the address bar so it is not left in history.
    window.history.replaceState(null, "", window.location.pathname);
    navigate(destination, { replace: true });
  }, [navigate]);

  return (
    <div className="auth-shell">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <div className="auth-card text-center">
              <img src={logo} alt="" className="auth-logo" />
              {error ? (
                <>
                  <h1 className="h4 mb-2">Could not sign you in</h1>
                  <p className="text-muted">{error}</p>
                  <Link to="/login" className="btn btn-primary mt-2">
                    Back to login
                  </Link>
                </>
              ) : (
                <>
                  <h1 className="h4 mb-2">Signing you in…</h1>
                  <p className="text-muted mb-0">
                    Finishing up with Google. This only takes a moment.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
