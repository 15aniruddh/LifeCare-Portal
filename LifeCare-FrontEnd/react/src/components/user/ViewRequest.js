import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import RequestServiceApi from "../../services/RequestServiceApi.js";
import PageHeader from "../common/PageHeader";
import DataTable from "../common/DataTable";
import { readAccount } from "../common/DashboardShell";
import StatusPill from "../common/StatusPill";
import { BED_TYPE_LABELS } from "../common/labels";

const COLUMNS = [
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
    key: "status",
    label: "Status",
    align: "end",
    render: (row) => <StatusPill status={row.status} />,
  },
];

export default function ViewRequest() {
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const account = readAccount("hospital");

  useEffect(() => {
    if (!account) {
      setLoaded(true);
      return;
    }

    RequestServiceApi.getAllRequestforHospital(account.id)
      .then((resp) => setRequests(Array.isArray(resp.data) ? resp.data : []))
      .catch((error) =>
        console.error("Request list failed", error?.response?.data ?? error)
      )
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container section-tight">
      <PageHeader
        title="Request history"
        subtitle="Every bed request patients have sent to your hospital."
        backTo="/hospitaldashboard"
      />
      <DataTable
        columns={COLUMNS}
        rows={requests}
        rowKey={(row) => row.requestid ?? row.id}
        emptyMessage={
          loaded ? "No requests have come in yet." : "Loading requests…"
        }
      />
    </div>
  );
}
