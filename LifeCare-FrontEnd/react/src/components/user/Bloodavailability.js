import React from "react";
import HospitalDirectory from "../common/HospitalDirectory";

const BLOOD_GROUPS = [
  { key: "a_pos", label: "A+" },
  { key: "a_neg", label: "A-" },
  { key: "b_pos", label: "B+" },
  { key: "b_neg", label: "B-" },
  { key: "o_pos", label: "O+" },
  { key: "o_neg", label: "O-" },
  { key: "ab_pos", label: "AB+" },
  { key: "ab_neg", label: "AB-" },
];

const tone = (count) =>
  count === 0 ? "pill-danger" : count < 5 ? "pill-warning" : "pill-success";

export default function Bloodavailability() {
  return (
    <HospitalDirectory
      title="Blood availability"
      subtitle="Pick a hospital to see units in stock for every blood group."
      summary={(hospital) => {
        const total = BLOOD_GROUPS.reduce(
          (sum, group) => sum + (Number(hospital[group.key]) || 0),
          0
        );
        const groupsInStock = BLOOD_GROUPS.filter(
          (group) => (Number(hospital[group.key]) || 0) > 0
        ).length;
        return (
          <>
            <span className={`pill ${tone(total)}`}>{total} units</span>
            <span className="pill pill-neutral">
              {groupsInStock}/8 groups in stock
            </span>
          </>
        );
      }}
    >
      {(hospital) => (
        <div className="row g-3">
          {BLOOD_GROUPS.map((group) => {
            const count = Number(hospital[group.key]) || 0;
            return (
              <div className="col-6 col-sm-4 col-lg-3" key={group.key}>
                <div className="stat-card text-center">
                  <div className="stat-card-value">{group.label}</div>
                  <div className="stat-card-label mb-2">
                    {count} unit{count === 1 ? "" : "s"}
                  </div>
                  <span className={`pill ${tone(count)}`}>
                    {count === 0 ? "Out of stock" : "In stock"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </HospitalDirectory>
  );
}
