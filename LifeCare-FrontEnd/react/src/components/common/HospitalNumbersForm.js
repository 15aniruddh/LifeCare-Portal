import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "./PageHeader";
import { readAccount } from "./DashboardShell";

/**
 * Form of whole-number fields that a hospital publishes (beds, blood, oxygen).
 *
 * `fields` is an array of { key, label }; `submit` receives (hospitalId, values)
 * and returns the axios promise.
 */
export default function HospitalNumbersForm({
  title,
  subtitle,
  fields,
  submit,
  successMessage,
  redirectTo,
  columnClass = "col-12 col-sm-6 col-lg-4",
}) {
  const navigate = useNavigate();
  const account = readAccount("hospital");

  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, ""]))
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const validate = () => {
    const next = {};
    fields.forEach((field) => {
      const raw = values[field.key];
      const parsed = Number(raw);
      if (raw === "" || !Number.isInteger(parsed) || parsed < 0) {
        next[field.key] = "Enter a whole number of 0 or more.";
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // The API expects numbers, not the strings the inputs hold.
    const payload = Object.fromEntries(
      fields.map((field) => [field.key, Number(values[field.key])])
    );

    setSubmitting(true);
    submit(account.id, payload)
      .then(() => {
        Swal.fire({
          title: successMessage,
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate(redirectTo || "/hospitaldashboard");
      })
      .catch((error) => {
        console.error("Save failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not save",
          text:
            error?.response?.data?.message ||
            "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container section-tight">
      <PageHeader
        title={title}
        subtitle={subtitle}
        backTo="/hospitaldashboard"
      />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="app-card p-3 p-sm-4">
            <form onSubmit={onSubmit} noValidate>
              <div className="row g-3">
                {fields.map((field) => (
                  <div className={columnClass} key={field.key}>
                    <label htmlFor={field.key} className="form-label">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      id={field.key}
                      name={field.key}
                      className={`form-control${
                        errors[field.key] ? " is-invalid" : ""
                      }`}
                      placeholder="0"
                      value={values[field.key]}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      required
                    />
                    {errors[field.key] && (
                      <div className="invalid-feedback">
                        {errors[field.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="d-grid d-sm-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
