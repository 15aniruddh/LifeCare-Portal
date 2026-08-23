import React, { useEffect, useMemo, useState } from "react";
import HospitalServiceApi from "../service/HospitalServiceApi.js";
import PageHeader from "./PageHeader";
import { readAccount } from "./DashboardShell";
import { IconArrowRight, IconInbox, IconPin, IconSearch } from "./Icons";

/**
 * Lists every hospital first, then drills into the one the user picks.
 *
 * `summary(hospital)` renders the at-a-glance line on each card in the list,
 * and `children(hospital, back)` renders the detail view for the selection.
 */
export default function HospitalDirectory({
  title,
  subtitle,
  summary,
  children,
}) {
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Browsing is public; only booking needs an account. Where "Back" goes
  // therefore depends on whether anyone is signed in.
  const account =
    readAccount("user") || readAccount("hospital") || readAccount("admin");
  const backTo = account ? "/userdashboard" : "/";

  useEffect(() => {
    HospitalServiceApi.getAllHospitals()
      .then((resp) => setHospitals(Array.isArray(resp.data) ? resp.data : []))
      .catch((error) => {
        console.error("Hospital list failed", error?.response?.data ?? error);
        setFailed(true);
      })
      .finally(() => setLoaded(true));
    // The list is the same for the whole session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Narrow the list as the user types; a directory of three is easy, but this
  // keeps working once there are fifty.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) =>
      `${h.hospitalname} ${h.address || ""}`.toLowerCase().includes(q)
    );
  }, [hospitals, query]);

  const back = () => setSelected(null);

  if (selected) {
    return (
      <div className="container section-tight">
        <PageHeader
          title={selected.hospitalname}
          subtitle={selected.address}
          backTo={backTo}
        />
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm mb-4"
          onClick={back}
        >
          ← All hospitals
        </button>
        {children(selected, back)}
      </div>
    );
  }

  return (
    <div className="container section-tight">
      <PageHeader title={title} subtitle={subtitle} backTo={backTo} />

      {hospitals.length > 3 && (
        <div className="app-card p-3 mb-4">
          <label htmlFor="hospitalfilter" className="form-label">
            Filter hospitals
          </label>
          <div className="position-relative">
            <input
              type="search"
              id="hospitalfilter"
              className="form-control"
              placeholder="Search by name or area"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            {loaded && !failed ? <IconSearch size={44} /> : <IconInbox size={44} />}
            <p className="mb-0">
              {!loaded
                ? "Loading hospitals…"
                : failed
                ? "Could not load the hospital list."
                : hospitals.length === 0
                ? "No hospitals are listed yet."
                : "No hospital matches that search."}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {visible.map((hospital) => (
            <div className="col-12 col-md-6 col-lg-4" key={hospital.hospid}>
              <button
                type="button"
                className="hospital-card"
                onClick={() => setSelected(hospital)}
              >
                <h3>{hospital.hospitalname}</h3>
                {hospital.address && (
                  <p className="hospital-card-address">
                    <IconPin size={15} />
                    <span>{hospital.address}</span>
                  </p>
                )}
                {summary && (
                  <div className="hospital-card-summary">
                    {summary(hospital)}
                  </div>
                )}
                <span className="hospital-card-cta">
                  View details
                  <IconArrowRight size={16} />
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
