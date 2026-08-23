import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import AdminServiceApi from "../service/AdminServiceApi.js";
import PageHeader from "../common/PageHeader";

const FIELDS = [
  { key: "hospitalname", label: "Hospital name", col: "col-12 col-sm-6" },
  { key: "email", label: "Email", type: "email", col: "col-12 col-sm-6" },
  { key: "contact", label: "Contact number", type: "tel", col: "col-12 col-sm-6" },
  {
    key: "ambulancecontact",
    label: "Ambulance contact",
    type: "tel",
    col: "col-12 col-sm-6",
  },
  { key: "address", label: "Address", textarea: true, col: "col-12" },
];

export default function Updatehospital() {
  const navigate = useNavigate();
  const { hospid } = useParams();
  const [hospital, setHospital] = useState({
    hospid,
    hospitalname: "",
    email: "",
    contact: "",
    address: "",
    ambulancecontact: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    AdminServiceApi.getByhospId(hospid)
      .then((response) => setHospital(response.data))
      .catch((error) =>
        console.error("Hospital load failed", error?.response?.data ?? error)
      )
      .finally(() => setLoading(false));
  }, [hospid]);

  const handleChange = (e) =>
    setHospital((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const updateHospital = (e) => {
    e.preventDefault();

    setSubmitting(true);
    AdminServiceApi.updateHospital(hospital, hospid)
      .then(() => {
        Swal.fire({
          title: "Hospital updated",
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate("/viewhospital");
      })
      .catch((error) => {
        console.error("Update failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not update the hospital",
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
        title="Update hospital"
        subtitle="Edit the details of a registered hospital."
        backTo="/viewhospital"
      />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="app-card p-3 p-sm-4">
            {loading ? (
              <p className="text-muted mb-0">Loading hospital details…</p>
            ) : (
              <form onSubmit={updateHospital}>
                <div className="row g-3">
                  {FIELDS.map((field) => (
                    <div className={field.col} key={field.key}>
                      <label htmlFor={field.key} className="form-label">
                        {field.label}
                      </label>
                      {field.textarea ? (
                        <textarea
                          rows="3"
                          id={field.key}
                          name={field.key}
                          className="form-control"
                          value={hospital[field.key] || ""}
                          onChange={handleChange}
                        ></textarea>
                      ) : (
                        <input
                          type={field.type || "text"}
                          id={field.key}
                          name={field.key}
                          className="form-control"
                          value={hospital[field.key] || ""}
                          onChange={handleChange}
                        />
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
                    {submitting ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
