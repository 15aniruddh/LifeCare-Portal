import HospitalNumbersForm from "../common/HospitalNumbersForm";
import HospitalServiceApi from "../../services/HospitalServiceApi.js";

const FIELDS = [
  { key: "oxygenavailable", label: "Oxygen cylinders available" },
];

export default function AddOxygen() {
  return (
    <HospitalNumbersForm
      title="Add oxygen"
      subtitle="Record how many oxygen cylinders you can supply."
      fields={FIELDS}
      submit={(id, payload) => HospitalServiceApi.addOxygen(id, payload)}
      successMessage="Oxygen availability updated"
      redirectTo="/oxygenlist"
      columnClass="col-12 col-sm-8 col-lg-6"
    />
  );
}
