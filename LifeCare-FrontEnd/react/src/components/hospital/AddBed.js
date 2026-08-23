import React from "react";
import HospitalNumbersForm from "../common/HospitalNumbersForm";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

const FIELDS = [
  { key: "ventilator", label: "Beds with ventilator" },
  { key: "oxygen", label: "Beds with oxygen cylinder" },
  { key: "normal", label: "Normal beds" },
];

export default function AddBed() {
  return (
    <HospitalNumbersForm
      title="Add beds"
      subtitle="Publish how many beds of each type are free right now."
      fields={FIELDS}
      submit={(id, payload) => HospitalServiceApi.addBed(id, payload)}
      successMessage="Bed availability updated"
      redirectTo="/bedlist"
    />
  );
}
