import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import LoginApi from "../../services/LoginApi.js";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { storeSession } from "../../services/httpAuth";
import GoogleButton from "./GoogleButton";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  // Google only appears once the backend reports it is configured, so an
  // unconfigured deployment never shows a button that would 404.
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    LoginApi.getProviders()
      .then((response) => {
        if (!cancelled) setGoogleEnabled(Boolean(response.data?.google));
      })
      // Password login still works if this probe fails; just leave Google off.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  const clearError = (field) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const validateEmail = () => {
    if (EMAIL_REGEX.test(email.trim())) {
      clearError("email");
      return true;
    }
    setError("email", "Enter a valid email such as abc@example.com.");
    return false;
  };

  const validatePassword = () => {
    if (password !== "") {
      clearError("password");
      return true;
    }
    setError("password", "Enter your password.");
    return false;
  };

  // Turn an axios failure into something worth showing the user.
  const describeError = (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return "That email and password combination did not match an account.";
    }
    const data = error?.response?.data;
    if (!data) {
      return "Could not reach the server. Please check your connection and try again.";
    }
    return data.message || data.error || "Something went wrong. Please try again.";
  };

  const login = (e) => {
    e.preventDefault();

    const checks = [validateEmail(), validatePassword()];
    if (checks.some((ok) => !ok)) return;

    setSubmitting(true);
    LoginApi.loginUser({ email: email.trim(), password })
      .then((response) => {
        navigate(storeSession(response.data));
      })
      .catch((error) => {
        console.error("Login failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not sign in",
          text: describeError(error),
          icon: "error",
          confirmButtonText: "Ok",
        });
      })
      .finally(() => setSubmitting(false));
  };

  const fieldClass = (field) =>
    `form-control${errors[field] ? " is-invalid" : ""}`;

  return (
    <div className="auth-shell">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <div className="auth-card">
              <div className="text-center mb-4">
                <img src={logo} alt="" className="auth-logo" />
                <h1 className="h3 mb-2">Welcome back</h1>
                <p className="text-muted mb-0">
                  Sign in to manage your bookings and requests.
                </p>
              </div>

              <form onSubmit={login} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={fieldClass("email")}
                    placeholder="abc@example.com"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={validateEmail}
                    autoComplete="email"
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={fieldClass("password")}
                    name="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    autoComplete="current-password"
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting || redirecting}
                  >
                    {submitting ? "Signing in…" : "Login"}
                  </button>
                </div>
              </form>

              {googleEnabled && (
                <>
                  <div className="auth-divider">
                    <span>or</span>
                  </div>

                  <GoogleButton
                    label={redirecting ? "Taking you to Google…" : "Continue with Google"}
                    disabled={submitting || redirecting}
                    onClick={() => {
                      setRedirecting(true);
                      LoginApi.startGoogleLogin();
                    }}
                  />
                </>
              )}

              <p className="text-center text-muted mt-4 mb-0">
                New to LifeCare? <Link to="/usersignup">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
