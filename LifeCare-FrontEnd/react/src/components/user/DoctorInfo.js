import React, { useEffect, useState } from "react";
import HospitalDirectory from "../common/HospitalDirectory";
import HospitalServiceApi from "../service/HospitalServiceApi.js";
import DataTable from "../common/DataTable";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "qualification", label: "Qualification" },
  { key: "specialization", label: "Specialization" },
];

/** Doctors listed under one hospital, fetched when that hospital is opened. */
function DoctorsForHospital({ hospital }) {
  const [doctors, setDoctors] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    HospitalServiceApi.getDoctorsByHospId(hospital.hospid)
      .then((resp) => setDoctors(Array.isArray(resp.data) ? resp.data : []))
      .catch((error) => {
        console.error("Doctor list failed", error?.response?.data ?? error);
        setDoctors([]);
      })
      .finally(() => setLoaded(true));
  }, [hospital.hospid]);

  return (
    <DataTable
      columns={COLUMNS}
      rows={doctors}
      rowKey={(doctor) => doctor.doctorid}
      emptyMessage={
        loaded
          ? `No doctors are listed for ${hospital.hospitalname} yet.`
          : "Loading doctors…"
      }
    />
  );
}

export default function DoctorInfo() {
  return (
    <HospitalDirectory
      title="Find a doctor"
      subtitle="Pick a hospital to see the specialists it has listed."
    >
      {(hospital) => <DoctorsForHospital hospital={hospital} />}
    </HospitalDirectory>
  );
}
