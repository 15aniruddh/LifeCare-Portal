import React from "react";
import { Link, Navigate } from "react-router-dom";
import { IconArrowRight } from "./Icons";

/**
 * Reads the signed-in account for `role` out of sessionStorage.
 * Returns null when nobody is signed in, or the stored value is unusable.
 */
export function readAccount(role) {
  const raw = sessionStorage.getItem(role);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch {
    sessionStorage.removeItem(role);
    return null;
  }
}

/**
 * Banner + action grid shared by the admin, hospital and user dashboards.
 * Sends anyone without a session for `role` back to the login page instead of
 * letting the page crash on a missing account.
 */
export default function DashboardShell({ role, title, subtitle, actions }) {
  const account = readAccount(role);

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const name = account.name || account.hospitalname || "";

  return (
    <>
      <div className="dashboard-banner">
        <div className="container">
          <span className="eyebrow text-capitalize">{role} dashboard</span>
          <h1 className="text-capitalize">
            {title} {name}
          </h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="container section-tight">
        <div className="row g-3 g-md-4">
          {actions.map((action) => (
            <div className="col-12 col-sm-6 col-lg-4" key={action.to}>
              <div className="action-card">
                <span className="tile-icon">{action.icon}</span>
                <h3>{action.title}</h3>
                <p>{action.text}</p>
                <Link
                  className={`btn ${action.variant || "btn-primary"} d-inline-flex align-items-center gap-2`}
                  to={action.to}
                >
                  {action.cta || "Open"}
                  <IconArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
