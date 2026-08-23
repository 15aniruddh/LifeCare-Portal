import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminServiceApi from "../service/AdminServiceApi.js";
import PageHeader from "../common/PageHeader";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
// The API requires at least 8 characters; keep the rules in sync with it.
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/;
const PHONE_REGEX = /^[2-9]\d{9}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

const PASSWORD_HINT =
  "At least 8 characters, including a lowercase letter, a number and a special character.";

export default function AddHospital() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    hospitalname: "",
    email: "",
    password: "",
    contact: "",
    ambulancecontact: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (values.hospitalname.trim() === "") {
      next.hospitalname = "Enter the hospital name.";
    }
    if (!EMAIL_REGEX.test(values.email.trim())) {
      next.email = "Enter a valid email such as abc@example.com.";
    }
    if (!PASSWORD_REGEX.test(values.password)) {
      next.password = PASSWORD_HINT;
    }
    if (!PHONE_REGEX.test(values.contact.trim())) {
      next.contact = "Enter a 10 digit contact number.";
    }
    if (!MOBILE_REGEX.test(values.ambulancecontact.trim())) {
      next.ambulancecontact =
        "Enter a 10 digit mobile number starting with 6-9.";
    }
    if (values.address.trim().length < 5) {
      next.address = "Enter the hospital address (at least 5 characters).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Turn an axios failure into a message worth showing.
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

  const addHospital = (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({
        title: "Please fix the highlighted fields",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    setSubmitting(true);
    AdminServiceApi.addHospital({
      hospitalname: values.hospitalname.trim(),
      email: values.email.trim(),
      password: values.password,
      contact: values.contact.trim(),
      address: values.address.trim(),
      ambulancecontact: values.ambulancecontact.trim(),
    })
      .then(() => {
        Swal.fire({
          title: "Hospital added",
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate("/viewhospital");
      })
      .catch((error) => {
        console.error("Add hospital failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not add the hospital",
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
    <div className="container section-tight">
      <PageHeader
        title="Add hospital"
        subtitle="Register a hospital so it can publish its availability."
        backTo="/admindashboard"
      />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="app-card p-3 p-sm-4">
            <form onSubmit={addHospital} noValidate>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label htmlFor="hospitalname" className="form-label">
                    Hospital name
                  </label>
                  <input
                    type="text"
                    id="hospitalname"
                    className={fieldClass("hospitalname")}
                    placeholder="e.g. Apollo Hospital"
                    value={values.hospitalname}
                    onChange={set("hospitalname")}
                    required
                  />
                  {errors.hospitalname && (
                    <div className="invalid-feedback">
                      {errors.hospitalname}
                    </div>
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
                    placeholder="admin@hospital.com"
                    value={values.email}
                    onChange={set("email")}
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
                    value={values.password}
                    onChange={set("password")}
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
                    placeholder="10 digit number"
                    value={values.contact}
                    onChange={set("contact")}
                    required
                  />
                  {errors.contact && (
                    <div className="invalid-feedback">{errors.contact}</div>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label htmlFor="ambulancecontact" className="form-label">
                    Ambulance contact
                  </label>
                  <input
                    type="tel"
                    id="ambulancecontact"
                    inputMode="numeric"
                    className={fieldClass("ambulancecontact")}
                    placeholder="10 digit mobile number"
                    value={values.ambulancecontact}
                    onChange={set("ambulancecontact")}
                    required
                  />
                  {errors.ambulancecontact && (
                    <div className="invalid-feedback">
                      {errors.ambulancecontact}
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
                    placeholder="Street, area, city"
                    value={values.address}
                    onChange={set("address")}
                    required
                  ></textarea>
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>
              </div>

              <div className="d-grid d-sm-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Adding hospital…" : "Add hospital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
