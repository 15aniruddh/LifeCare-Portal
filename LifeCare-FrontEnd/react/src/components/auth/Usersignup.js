import React, { useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import UserServiceApi from "../../services/UserServiceApi";
import { useNavigate } from "react-router";
import logo from "../../assets/images/logo.png";

// A name is one or more alphabetic words, optionally joined by a space,
// hyphen or apostrophe. Single-word names ("Aniruddh") are valid.
const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
// The API requires at least 8 characters; keep the rules in sync with it.
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

const PASSWORD_HINT =
  "Password needs at least 8 characters, including a lowercase letter, a number and a special character.";

export default function Usersignup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const setError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  const clearError = (field) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const validateName = () => {
    if (NAME_REGEX.test(name.trim())) {
      clearError("name");
      return true;
    }
    setError("name", "Name must contain letters only.");
    return false;
  };

  const validateEmail = () => {
    if (EMAIL_REGEX.test(email.trim())) {
      clearError("email");
      return true;
    }
    setError("email", "Enter a valid email such as abc@example.com.");
    return false;
  };

  const validatePassword = () => {
    if (PASSWORD_REGEX.test(password)) {
      clearError("password");
      return true;
    }
    setError("password", PASSWORD_HINT);
    return false;
  };

  const validateMobileNumber = () => {
    if (MOBILE_REGEX.test(contact.trim())) {
      clearError("contact");
      return true;
    }
    setError("contact", "Enter a 10 digit mobile number starting with 6-9.");
    return false;
  };

  const validateAge = () => {
    const parsed = Number(age);
    if (age !== "" && Number.isInteger(parsed) && parsed > 0 && parsed <= 150) {
      clearError("age");
      return true;
    }
    setError("age", "Enter an age between 1 and 150.");
    return false;
  };

  const validateAddress = () => {
    if (address.trim().length >= 5) {
      clearError("address");
      return true;
    }
    setError("address", "Enter your address (at least 5 characters).");
    return false;
  };

  const validateGender = () => {
    if (gender !== "") {
      clearError("gender");
      return true;
    }
    setError("gender", "Select a gender.");
    return false;
  };

  // Turn an axios failure into a message worth showing the user.
  const describeError = (error) => {
    const data = error?.response?.data;
    if (!data) {
      return "Could not reach the server. Please check your connection and try again.";
    }
    if (Array.isArray(data.details) && data.details.length > 0) {
      return data.details
        .map((d) => {
          const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "";
          return field ? `${field}: ${d.msg}` : d.msg;
        })
        .join("\n");
    }
    return data.message || data.error || "Something went wrong. Please try again.";
  };

  const signUp = (e) => {
    e.preventDefault();

    // Run every check so the user sees all the problems at once.
    const checks = [
      validateName(),
      validateEmail(),
      validatePassword(),
      validateMobileNumber(),
      validateGender(),
      validateAge(),
      validateAddress(),
    ];

    if (checks.some((ok) => !ok)) {
      Swal.fire({
        title: "Please fix the highlighted fields",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const user = {
      name: name.trim(),
      email: email.trim(),
      password,
      contact: contact.trim(),
      address: address.trim(),
      gender,
      age: Number(age),
    };

    setSubmitting(true);
    UserServiceApi.addUser(user)
      .then(() => {
        Swal.fire({
          title: "Account created successfully!",
          text: "You can now sign in with your email and password.",
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate("/login");
      })
      .catch((error) => {
        console.error("Sign up failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not create the account",
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
          <div className="col-12 col-md-10 col-lg-8">
            <div className="auth-card">
              <div className="text-center mb-4">
                <img src={logo} alt="" className="auth-logo" />
                <h1 className="h3 mb-2">Create your account</h1>
                <p className="text-muted mb-0">
                  Register to book beds, blood, oxygen and more.
                </p>
              </div>

              <form onSubmit={signUp} noValidate>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label htmlFor="name" className="form-label">
                      Full name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={fieldClass("name")}
                      placeholder="e.g. Aniruddh Sharma"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={validateName}
                      autoComplete="name"
                      required
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
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

                  <div className="col-12">
                    <label htmlFor="pwd" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      id="pwd"
                      className={fieldClass("password")}
                      placeholder="At least 8 characters"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={validatePassword}
                      autoComplete="new-password"
                      required
                    />
                    {errors.password ? (
                      <div className="invalid-feedback">{errors.password}</div>
                    ) : (
                      <div className="form-text">{PASSWORD_HINT}</div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label htmlFor="contact" className="form-label">
                      Contact number
                    </label>
                    <input
                      type="tel"
                      id="contact"
                      inputMode="numeric"
                      className={fieldClass("contact")}
                      placeholder="10 digit mobile number"
                      name="contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      onBlur={validateMobileNumber}
                      autoComplete="tel"
                      required
                    />
                    {errors.contact && (
                      <div className="invalid-feedback">{errors.contact}</div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6">
                    <label htmlFor="age" className="form-label">
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      min="1"
                      max="150"
                      className={fieldClass("age")}
                      placeholder="e.g. 31"
                      name="age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      onBlur={validateAge}
                      required
                    />
                    {errors.age && (
                      <div className="invalid-feedback">{errors.age}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <span className="form-label d-block">Gender</span>
                    <div className="d-flex flex-wrap gap-3">
                      {[
                        { value: "MALE", label: "Male" },
                        { value: "FEMALE", label: "Female" },
                        { value: "OTHER", label: "Other" },
                      ].map((option) => (
                        <div className="form-check" key={option.value}>
                          <input
                            className="form-check-input"
                            type="radio"
                            id={option.value}
                            name="gender"
                            value={option.value}
                            checked={gender === option.value}
                            onChange={(e) => {
                              setGender(e.target.value);
                              clearError("gender");
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={option.value}
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.gender && (
                      <div className="text-danger small mt-1">
                        {errors.gender}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <textarea
                      rows="3"
                      id="address"
                      className={fieldClass("address")}
                      placeholder="House / street, area, city"
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={validateAddress}
                      required
                    ></textarea>
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>
                </div>

                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? "Creating account\u2026" : "Sign Up"}
                  </button>
                </div>
              </form>

              <p className="text-center text-muted mt-4 mb-0">
                Already registered? <Link to="/login">Sign in instead</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
