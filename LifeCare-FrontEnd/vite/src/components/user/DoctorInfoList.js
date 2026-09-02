import { useCallback, useEffect, useState } from "react";
import HospitalServiceApi from "../../services/HospitalServiceApi.js";
import PageHeader from "../common/PageHeader";
import DataTable from "../common/DataTable";
import { readAccount } from "../common/DashboardShell";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "qualification", label: "Qualification" },
  { key: "specialization", label: "Specialization" },
];

export default function DoctorInfoList() {
  const [doctors, setDoctors] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    const hospital = readAccount("hospital");
    if (!hospital) {
      setLoaded(true);
      return;
    }

    HospitalServiceApi.getDoctorsByHospId(hospital.id)
      .then((resp) => setDoctors(Array.isArray(resp.data) ? resp.data : []))
      .catch((error) =>
        console.error("Doctor list failed", error?.response?.data ?? error)
      )
      .finally(() => setLoaded(true));
  }, []);

  useEffect(reload, [reload]);

  return (
    <div className="container section-tight">
      <PageHeader
        title="Doctor list"
        subtitle="Specialists listed under your hospital."
        backTo="/hospitaldashboard"
      />
      <DataTable
        columns={COLUMNS}
        rows={doctors}
        rowKey={(doctor) => doctor.doctorid}
        emptyMessage={
          loaded ? "No doctors added yet." : "Loading doctors…"
        }
      />
    </div>
  );
}
