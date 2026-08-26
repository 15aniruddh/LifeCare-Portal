import React from "react";
import HospitalNumbersForm from "../common/HospitalNumbersForm";
import HospitalServiceApi from "../../services/HospitalServiceApi.js";

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

export default function AddBlood() {
  return (
    <HospitalNumbersForm
      title="Add blood stock"
      subtitle="Record how many units of each blood group you hold."
      fields={FIELDS}
      submit={(id, payload) => HospitalServiceApi.addBlood(id, payload)}
      successMessage="Blood stock updated"
      redirectTo="/bloodlist"
      columnClass="col-6 col-sm-4 col-lg-3"
    />
  );
}
