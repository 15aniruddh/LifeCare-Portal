import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import AdminServiceApi from "../../services/AdminServiceApi.js";
import HospitalServiceApi from "../../services/HospitalServiceApi.js";
import PageHeader from "../common/PageHeader";
import DataTable from "../common/DataTable";

export default function Hospitallist() {
  const [hospitals, setHospitals] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    AdminServiceApi.fetchAllHospitals()
      .then((resp) => setHospitals(Array.isArray(resp.data) ? resp.data : []))
      .catch((error) =>
        console.error("Hospital list failed", error?.response?.data ?? error)
      )
      .finally(() => setLoaded(true));
  }, []);

  useEffect(reload, [reload]);

  const deleteHospital = (hospital) => {
    Swal.fire({
      title: "Delete this hospital?",
      text: `${hospital.hospitalname} will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d0384a",
    }).then((result) => {
      if (!result.isConfirmed) return;

      HospitalServiceApi.deleteHospital(hospital.hospid)
        .then(() => {
          setHospitals((prev) =>
            prev.filter((row) => row.hospid !== hospital.hospid)
          );
          Swal.fire({
            title: "Hospital deleted",
            icon: "success",
            confirmButtonText: "Ok",
          });
        })
        .catch((error) => {
          console.error("Delete failed", error?.response?.data ?? error);
          Swal.fire({
            title: "Could not delete the hospital",
            text:
              error?.response?.data?.message ||
              "Something went wrong. Please try again.",
            icon: "error",
            confirmButtonText: "Ok",
          });
        });
    });
  };

  const columns = [
    { key: "hospitalname", label: "Hospital" },
    { key: "address", label: "Address" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "ambulancecontact", label: "Ambulance" },
    {
      key: "action",
      label: "Action",
      align: "end",
      render: (row) => (
        <div className="d-flex gap-2 justify-content-end">
          <Link
            className="btn btn-outline-primary btn-sm"
            to={`/updatehospital/${row.hospid}`}
          >
            Update
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => deleteHospital(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container section-tight">
      <PageHeader
        title="Hospital list"
        subtitle="Every hospital registered on the portal."
        backTo="/admindashboard"
      />
      <DataTable
        columns={columns}
        rows={hospitals}
        rowKey={(row) => row.hospid}
        emptyMessage={
          loaded ? "No hospitals registered yet." : "Loading hospitals…"
        }
      />
    </div>
  );
}
