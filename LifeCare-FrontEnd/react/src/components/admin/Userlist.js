import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import AdminServiceApi from "../../services/AdminServiceApi.js";
import UserServiceApi from "../../services/UserServiceApi.js";
import PageHeader from "../common/PageHeader";
import DataTable from "../common/DataTable";

export default function Userlist() {
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    AdminServiceApi.fetchAllUsers()
      .then((resp) => setUsers(Array.isArray(resp.data) ? resp.data : []))
      .catch((error) =>
        console.error("User list failed", error?.response?.data ?? error)
      )
      .finally(() => setLoaded(true));
  }, []);

  useEffect(reload, [reload]);

  const deleteUser = (user) => {
    Swal.fire({
      title: "Delete this user?",
      text: `${user.name} will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d0384a",
    }).then((result) => {
      if (!result.isConfirmed) return;

      UserServiceApi.deleteUser(user.userid)
        .then(() => {
          setUsers((prev) => prev.filter((row) => row.userid !== user.userid));
          Swal.fire({
            title: "User deleted",
            icon: "success",
            confirmButtonText: "Ok",
          });
        })
        .catch((error) => {
          console.error("Delete failed", error?.response?.data ?? error);
          Swal.fire({
            title: "Could not delete the user",
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
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "address", label: "Address" },
    {
      key: "gender",
      label: "Gender",
      render: (row) => (
        <span className="text-capitalize">
          {String(row.gender || "").toLowerCase() || "—"}
        </span>
      ),
    },
    { key: "age", label: "Age" },
    {
      key: "action",
      label: "Action",
      align: "end",
      render: (row) => (
        <div className="d-flex gap-2 justify-content-end">
          <Link
            className="btn btn-outline-primary btn-sm"
            to={`/updateuser/${row.userid}`}
          >
            Update
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => deleteUser(row)}
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
        title="User list"
        subtitle="Everyone registered on the portal."
        backTo="/admindashboard"
      />
      <DataTable
        columns={columns}
        rows={users}
        rowKey={(row) => row.userid}
        emptyMessage={loaded ? "No users registered yet." : "Loading users…"}
      />
    </div>
  );
}
