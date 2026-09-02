import HospitalDirectory from "../common/HospitalDirectory";
import { IconAmbulance, IconPhone, IconPin } from "../common/Icons";

export default function AmbulanceContact() {
  return (
    <HospitalDirectory
      title="Ambulance contacts"
      subtitle="Pick a hospital to see its verified ambulance details."
      summary={(hospital) => (
        <span
          className={`pill ${
            hospital.ambulancecontact ? "pill-success" : "pill-danger"
          }`}
        >
          {hospital.ambulancecontact ? "Ambulance listed" : "No number listed"}
        </span>
      )}
    >
      {(hospital) => (
        <div className="app-card p-4">
          <div className="d-flex flex-wrap align-items-start gap-3 mb-4">
            <span className="tile-icon">
              <IconAmbulance />
            </span>
            <div>
              <h2 className="h5 mb-1">Emergency ambulance service</h2>
              <p className="text-muted mb-0">{hospital.hospitalname}</p>
            </div>
          </div>

          {/* Both items share one grid shape so their icons, labels and
              values line up across the two columns. */}
          <div className="row g-3 g-md-4">
            <div className="col-12 col-md-7">
              <div className="detail-item">
                <IconPin size={18} />
                <div>
                  <span className="detail-label">Address</span>
                  <p className="detail-value">
                    {hospital.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-5">
              <div className="detail-item">
                <IconPhone size={18} />
                <div>
                  <span className="detail-label">Ambulance contact</span>
                  <p className="detail-value">
                    {hospital.ambulancecontact ? (
                      <a href={`tel:${hospital.ambulancecontact}`}>
                        {hospital.ambulancecontact}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {hospital.ambulancecontact && (
            <a
              className="btn btn-primary btn-sm mt-4"
              href={`tel:${hospital.ambulancecontact}`}
            >
              Call ambulance
            </a>
          )}
        </div>
      )}
    </HospitalDirectory>
  );
}
