import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import HospitalServiceApi from "../../services/HospitalServiceApi.js";
import PageHeader from "../common/PageHeader";
import { readAccount } from "../common/DashboardShell";

const NAME_REGEX = /^[A-Za-z]+(?:[ '.-][A-Za-z]+)*$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const FIELDS = [
  {
    key: "name",
    label: "Doctor name",
    placeholder: "e.g. Olivia Bennett",
    autoComplete: "name",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "doctor@hospital.com",
    autoComplete: "email",
  },
  {
    key: "qualification",
    label: "Qualification",
    placeholder: "e.g. MBBS, MD",
  },
  {
    key: "specialization",
    label: "Specialization",
    placeholder: "e.g. Dermatology",
  },
];

export default function AddDoctorinfo() {
  const navigate = useNavigate();
  const account = readAccount("hospital");

  const [values, setValues] = useState({
    name: "",
    email: "",
    qualification: "",
    specialization: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const validate = () => {
    const next = {};
    if (!NAME_REGEX.test(values.name.trim())) {
      next.name = "Name must contain letters only.";
    }
    if (!EMAIL_REGEX.test(values.email.trim())) {
      next.email = "Enter a valid email such as abc@example.com.";
    }
    if (values.qualification.trim() === "") {
      next.qualification = "Enter the doctor's qualification.";
    }
    if (values.specialization.trim() === "") {
      next.specialization = "Enter the doctor's specialization.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    HospitalServiceApi.addDoctorinfo(account.id, {
      name: values.name.trim(),
      email: values.email.trim(),
      qualification: values.qualification.trim(),
      specialization: values.specialization.trim(),
    })
      .then(() => {
        Swal.fire({
          title: "Doctor added",
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate("/doctorinfolist");
      })
      .catch((error) => {
        console.error("Add doctor failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not add the doctor",
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
        title="Add doctor"
        subtitle="List a specialist under your hospital."
        backTo="/hospitaldashboard"
      />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="app-card p-3 p-sm-4">
            <form onSubmit={onSubmit} noValidate>
              <div className="row g-3">
                {FIELDS.map((field) => (
                  <div className="col-12 col-sm-6" key={field.key}>
                    <label htmlFor={field.key} className="form-label">
                      {field.label}
                    </label>
                    <input
                      type={field.type || "text"}
                      id={field.key}
                      name={field.key}
                      className={`form-control${
                        errors[field.key] ? " is-invalid" : ""
                      }`}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
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
                  {submitting ? "Saving…" : "Add doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
