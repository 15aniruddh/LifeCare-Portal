import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import UserServiceApi from "../../services/UserServiceApi.js";
import PageHeader from "../common/PageHeader";

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export default function Updateuser() {
  const navigate = useNavigate();
  const { userid } = useParams();
  const [user, setUser] = useState({
    userid,
    name: "",
    email: "",
    contact: "",
    address: "",
    gender: "",
    age: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    UserServiceApi.getById(userid)
      .then((response) => setUser(response.data))
      .catch((error) =>
        console.error("User load failed", error?.response?.data ?? error)
      )
      .finally(() => setLoading(false));
  }, [userid]);

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const updateUser = (e) => {
    e.preventDefault();

    setSubmitting(true);
    // The API stores age as a number, not the string the input holds.
    UserServiceApi.updateUser({ ...user, age: Number(user.age) || 0 }, userid)
      .then(() => {
        Swal.fire({
          title: "User updated",
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate("/viewuser");
      })
      .catch((error) => {
        console.error("Update failed", error?.response?.data ?? error);
        Swal.fire({
          title: "Could not update the user",
          text:
            error?.response?.data?.message ||
            "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container section-tight">
      <PageHeader
        title="Update user"
        subtitle="Edit the details of a registered user."
        backTo="/viewuser"
      />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="app-card p-3 p-sm-4">
            {loading ? (
              <p className="text-muted mb-0">Loading user details…</p>
            ) : (
              <form onSubmit={updateUser}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label htmlFor="name" className="form-label">
                      Full name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={user.name || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={user.email || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label htmlFor="contact" className="form-label">
                      Contact number
                    </label>
                    <input
                      type="tel"
                      id="contact"
                      name="contact"
                      className="form-control"
                      value={user.contact || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-sm-3">
                    <label htmlFor="age" className="form-label">
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="1"
                      max="150"
                      className="form-control"
                      value={user.age ?? ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-sm-3">
                    <label htmlFor="gender" className="form-label">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="form-select"
                      value={user.gender || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {GENDERS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <textarea
                      rows="3"
                      id="address"
                      name="address"
                      className="form-control"
                      value={user.address || ""}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="d-grid d-sm-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
