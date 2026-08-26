import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import HospitalServiceApi from "../../services/HospitalServiceApi.js";
import PageHeader from "./PageHeader";
import { readAccount } from "./DashboardShell";

/**
 * Loads the signed-in hospital and shows one stat card per field in `fields`
 * (an array of { key, label }). Used by the bed, blood and oxygen list pages.
 */
export default function HospitalStatsPage({
  title,
  subtitle,
  fields,
  columnClass = "col-6 col-sm-4 col-lg-3",
}) {
  const [hospital, setHospital] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const account = readAccount("hospital");

  useEffect(() => {
    if (!account) {
      setLoaded(true);
      return;
    }

    HospitalServiceApi.getHospitalById(account.id)
      .then((resp) => setHospital(resp.data || null))
      .catch((error) =>
        console.error("Hospital load failed", error?.response?.data ?? error)
      )
      .finally(() => setLoaded(true));
    // The account id is stable for the lifetime of the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container section-tight">
      <PageHeader
        title={title}
        subtitle={subtitle}
        backTo="/hospitaldashboard"
      />

      {hospital && (
        <h2 className="h5 mb-3 text-capitalize">{hospital.hospitalname}</h2>
      )}

      {loaded && !hospital ? (
        <div className="table-card">
          <div className="empty-state">
            <p className="mb-0">Could not load your hospital details.</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {fields.map((field) => {
            const count = Number(hospital?.[field.key]) || 0;
            return (
              <div className={columnClass} key={field.key}>
                <div className="stat-card">
                  <div className="stat-card-label">{field.label}</div>
                  <div className="stat-card-value">{loaded ? count : "—"}</div>
                  {loaded && (
                    <span
                      className={`pill ${
                        count === 0
                          ? "pill-danger"
                          : count < 5
                          ? "pill-warning"
                          : "pill-success"
                      }`}
                    >
                      {count === 0 ? "None left" : "Available"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
