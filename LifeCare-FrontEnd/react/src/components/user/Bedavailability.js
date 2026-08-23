import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import HospitalDirectory from "../common/HospitalDirectory";
import { readAccount } from "../common/DashboardShell";

const BED_TYPES = [
  { key: "ventilator", label: "Bed with ventilator", short: "Ventilator" },
  { key: "oxygen", label: "Bed with oxygen cylinder", short: "Oxygen" },
  { key: "normal", label: "Normal bed", short: "Normal" },
];

const tone = (count) =>
  count === 0 ? "pill-danger" : count < 5 ? "pill-warning" : "pill-success";

export default function Bedavailability() {
  const navigate = useNavigate();

  const book = (hospital) => {
    // Userbedbook reads the chosen hospital back out of session storage.
    sessionStorage.setItem("id", hospital.hospid);

    // Browsing is public, but a booking has to belong to an account.
    if (!readAccount("user")) {
      Swal.fire({
        title: "Sign in to book",
        text: "Create a free account or sign in to send a booking request.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sign in",
        cancelButtonText: "Not now",
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }

    navigate("/userbedbook");
  };

  return (
    <HospitalDirectory
      title="Bed availability"
      subtitle="Pick a hospital to see its beds and send a booking request."
      summary={(hospital) =>
        BED_TYPES.map((type) => {
          const count = Number(hospital[type.key]) || 0;
          return (
            <span className={`pill ${tone(count)}`} key={type.key}>
              {type.short}: {count}
            </span>
          );
        })
      }
    >
      {(hospital) => (
        <>
          <div className="row g-3 g-md-4 mb-4">
            {BED_TYPES.map((type) => {
              const count = Number(hospital[type.key]) || 0;
              return (
                <div className="col-12 col-md-4" key={type.key}>
                  <div className="stat-card">
                    <div className="stat-card-label">{type.label}</div>
                    <div className="stat-card-value">{count}</div>
                    <span className={`pill ${tone(count)}`}>
                      {count === 0 ? "None free" : `${count} available`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="app-card p-3 p-sm-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h2 className="h5 mb-1">Need one of these beds?</h2>
              <p className="text-muted mb-0">
                Send a booking request to {hospital.hospitalname}.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => book(hospital)}
            >
              Book a bed
            </button>
          </div>
        </>
      )}
    </HospitalDirectory>
  );
}
