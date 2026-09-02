import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import RequestServiceApi from "../../services/RequestServiceApi.js";
import PageHeader from "../common/PageHeader";
import { readAccount } from "../common/DashboardShell";

export default function Userbedbook() {
  const navigate = useNavigate();
  const [bedtype, setBedtype] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [timetoarrive, setTimetoarrive] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const account = readAccount("user");
  // Bedavailability stores the hospital the user picked before coming here.
  const hospitalId = sessionStorage.getItem("id");

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const validate = () => {
    const next = {};
    if (bedtype === "") next.bedtype = "Choose the type of bed you need.";
    if (symptoms.trim().length < 3)
      next.symptoms = "Describe the symptoms briefly.";
    const minutes = Number(timetoarrive);
    if (timetoarrive === "" || !Number.isFinite(minutes) || minutes < 0)
      next.timetoarrive = "Enter how many minutes away you are.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveRequest = (e) => {
    e.preventDefault();

    if (!hospitalId) {
      Swal.fire({
        title: "Choose a hospital first",
        text: "Search for a hospital on the bed availability page, then book.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      navigate("/bedavailability");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    RequestServiceApi.addRequest(account.id, hospitalId, {
      bedtype,
      symptoms: symptoms.trim(),
      timetoarrive: Number(timetoarrive),
      status: "pending",
    })
      .then(() => {
        Swal.fire({
          title: "Request sent",
          text: "The hospital will review your request shortly.",
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate("/bookingstatus");
      })
      .catch((error) => {
        console.error("Booking failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not send the request",
          text:
            error?.response?.data?.message ||
            "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      })
      .finally(() => setSubmitting(false));
  };

  const fieldClass = (field, base = "form-control") =>
    `${base}${errors[field] ? " is-invalid" : ""}`;

  return (
    <div className="container section-tight">
      <PageHeader
        title="Book a bed"
        subtitle="Tell the hospital what you need and when you will arrive."
        backTo="/bedavailability"
      />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="app-card p-3 p-sm-4">
            <form onSubmit={saveRequest} noValidate>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="bedtype" className="form-label">
                    Type of bed
                  </label>
                  <select
                    id="bedtype"
                    className={fieldClass("bedtype", "form-select")}
                    name="bedtype"
                    value={bedtype}
                    onChange={(e) => setBedtype(e.target.value)}
                    required
                  >
                    <option value="">Select the type of bed</option>
                    <option value="ventilator">Bed with ventilator</option>
                    <option value="oxygen">Bed with oxygen cylinder</option>
                    <option value="normal">Normal bed</option>
                  </select>
                  {errors.bedtype && (
                    <div className="invalid-feedback">{errors.bedtype}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="symptoms" className="form-label">
                    Symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    rows="3"
                    className={fieldClass("symptoms")}
                    placeholder="Briefly describe the patient's symptoms"
                    name="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    required
                  ></textarea>
                  {errors.symptoms && (
                    <div className="invalid-feedback">{errors.symptoms}</div>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label htmlFor="timetoarrive" className="form-label">
                    Time to arrive (minutes)
                  </label>
                  <input
                    type="number"
                    id="timetoarrive"
                    min="0"
                    className={fieldClass("timetoarrive")}
                    placeholder="e.g. 30"
                    name="timetoarrive"
                    value={timetoarrive}
                    onChange={(e) => setTimetoarrive(e.target.value)}
                    required
                  />
                  {errors.timetoarrive && (
                    <div className="invalid-feedback">
                      {errors.timetoarrive}
                    </div>
                  )}
                </div>
              </div>

              <div className="d-grid d-sm-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Sending request…" : "Send request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
