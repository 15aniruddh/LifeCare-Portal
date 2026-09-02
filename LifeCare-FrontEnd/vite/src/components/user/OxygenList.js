import HospitalStatsPage from "../common/HospitalStatsPage";

const FIELDS = [
  { key: "oxygenavailable", label: "Oxygen cylinders available" },
];

export default function OxygenList() {
  return (
    <HospitalStatsPage
      title="Oxygen list"
      subtitle="Oxygen cylinders currently published by your hospital."
      fields={FIELDS}
      columnClass="col-12 col-md-6 col-lg-4"
    />
  );
}
