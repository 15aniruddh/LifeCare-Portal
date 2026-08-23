import React from "react";
import HospitalStatsPage from "../common/HospitalStatsPage";

const FIELDS = [
  { key: "a_pos", label: "A+" },
  { key: "a_neg", label: "A-" },
  { key: "b_pos", label: "B+" },
  { key: "b_neg", label: "B-" },
  { key: "o_pos", label: "O+" },
  { key: "o_neg", label: "O-" },
  { key: "ab_pos", label: "AB+" },
  { key: "ab_neg", label: "AB-" },
];

export default function BloodList() {
  return (
    <HospitalStatsPage
      title="Blood list"
      subtitle="Units in stock for each blood group at your hospital."
      fields={FIELDS}
    />
  );
}
