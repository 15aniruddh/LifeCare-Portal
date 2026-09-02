import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import RequestServiceApi from "../../services/RequestServiceApi.js";
import PageHeader from "../common/PageHeader";
import DataTable from "../common/DataTable";
import { readAccount } from "../common/DashboardShell";
import { BED_TYPE_LABELS } from "../common/labels";

export default function ApproveRejectRequest() {
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const account = readAccount("hospital");

  const reload = useCallback((hospitalId) => {
    RequestServiceApi.getAllPendingRequestforHospital(hospitalId)
      .then((resp) => setRequests(Array.isArray(resp.data) ? resp.data : []))
      .catch((error) =>
        console.error("Pending requests failed", error?.response?.data ?? error)
      )
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!account) {
      setLoaded(true);
      return;
    }
    reload(account.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const decide = (decision, reqid) => {
    setBusyId(reqid);
    RequestServiceApi.acceptrejectPendingRequest(decision, reqid)
      .then(() => {
        Swal.fire({
          title:
            decision === "accepted" ? "Request accepted" : "Request rejected",
          icon: "success",
          confirmButtonText: "Ok",
        });
        // Refresh in place rather than bouncing back to the dashboard.
        reload(account.id);
      })
      .catch((error) => {
        console.error("Decision failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not update the request",
          text:
            error?.response?.data?.message ||
            "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      })
      .finally(() => setBusyId(null));
  };

  const columns = [
    {
      key: "bedtype",
      label: "Type of bed",
      render: (row) => BED_TYPE_LABELS[row.bedtype] || row.bedtype,
    },
    { key: "symptoms", label: "Symptoms" },
    {
      key: "timetoarrive",
      label: "Arriving in",
      render: (row) => `${row.timetoarrive} min`,
    },
    {
      key: "action",
      label: "Action",
      align: "end",
      render: (row) => (
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={() => decide("accepted", row.reqid)}
            disabled={busyId === row.reqid}
          >
            Accept
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => decide("rejected", row.reqid)}
            disabled={busyId === row.reqid}
          >
            Decline
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container section-tight">
      <PageHeader
        title="Action on requests"
        subtitle="Bed requests waiting for your decision."
        backTo="/hospitaldashboard"
      />
      <DataTable
        columns={columns}
        rows={requests}
        rowKey={(row) => row.reqid}
        emptyMessage={
          loaded ? "No requests are waiting for a decision." : "Loading requests…"
        }
      />
    </div>
  );
}
