import React from "react";
import HospitalDirectory from "../common/HospitalDirectory";
import { IconOxygen } from "../common/Icons";

const tone = (count) =>
  count === 0 ? "pill-danger" : count < 5 ? "pill-warning" : "pill-success";

export default function Oxygenavailability() {
  return (
    <HospitalDirectory
      title="Oxygen availability"
      subtitle="Pick a hospital to see how many cylinders it has in stock."
      summary={(hospital) => {
        const count = Number(hospital.oxygenavailable) || 0;
        return (
          <span className={`pill ${tone(count)}`}>{count} cylinders</span>
        );
      }}
    >
      {(hospital) => {
        const count = Number(hospital.oxygenavailable) || 0;
        return (
          <div className="app-card p-4">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <span className="tile-icon">
                <IconOxygen />
              </span>
              <div className="me-auto">
                <h2 className="h5 mb-1">Oxygen cylinders</h2>
                <p className="text-muted mb-0">
                  Currently available at {hospital.hospitalname}
                </p>
              </div>
              <div className="text-end">
                <div className="stat-card-value">{count}</div>
                <span className={`pill ${tone(count)}`}>
                  {count === 0 ? "Out of stock" : "In stock"}
                </span>
              </div>
            </div>
          </div>
        );
      }}
    </HospitalDirectory>
  );
}
