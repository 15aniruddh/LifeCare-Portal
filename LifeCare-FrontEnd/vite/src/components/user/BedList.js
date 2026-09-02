import HospitalStatsPage from "../common/HospitalStatsPage";

const FIELDS = [
  { key: "ventilator", label: "Bed with ventilator" },
  { key: "oxygen", label: "Bed with oxygen cylinder" },
  { key: "normal", label: "Normal bed" },
];

export default function BedList() {
  return (
    <HospitalStatsPage
      title="Bed list"
      subtitle="Bed availability currently published by your hospital."
      fields={FIELDS}
      columnClass="col-12 col-md-4"
    />
  );
}
