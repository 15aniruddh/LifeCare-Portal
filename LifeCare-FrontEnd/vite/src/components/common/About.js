import { Link } from "react-router-dom";
import aniruddh from "../../assets/images/team1.png";
import shubham from "../../assets/images/team2.png";
import omkar from "../../assets/images/team3.png";
import vaibhav from "../../assets/images/team4.png";
import mission from "../../assets/images/doctor2.jpg";
import { IconCheck, IconClock, IconHeart, IconShield, IconUsers } from "./Icons";

const TEAM = [
  { name: "Aniruddh Patil", role: "Full-stack developer", photo: aniruddh },
  { name: "Shubham Yadav", role: "Backend developer", photo: shubham },
  { name: "Omkar More", role: "Frontend developer", photo: omkar },
  { name: "Vaibhav Pawar", role: "QA & documentation", photo: vaibhav },
];

const VALUES = [
  {
    icon: <IconClock />,
    title: "Speed when it matters",
    text: "In an emergency, minutes decide outcomes. Everything here is built to cut the search down to seconds.",
  },
  {
    icon: <IconShield />,
    title: "Information you can trust",
    text: "Availability is published by the hospitals themselves, so what you see is what they actually have.",
  },
  {
    icon: <IconUsers />,
    title: "Open to everyone",
    text: "Browsing availability needs no account. Registration is only for booking and tracking requests.",
  },
];

export default function About() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-6">
              <span className="eyebrow">
                <IconHeart size={15} />
                About us
              </span>
              <h1>
                Making hospital care{" "}
                <span className="text-accent">easier to reach</span>
              </h1>
              <p className="hero-lead">
                LifeCare Portal grew out of the last pandemic, when finding a
                bed or an oxygen cylinder meant calling a dozen hospitals one
                after another. We wanted that search to take one page instead.
              </p>
              <ul className="check-list">
                <li>
                  <IconCheck />
                  <span>Bed, blood and oxygen availability in one place</span>
                </li>
                <li>
                  <IconCheck />
                  <span>Doctor and ambulance details for every hospital</span>
                </li>
                <li>
                  <IconCheck />
                  <span>Booking requests you can follow to a decision</span>
                </li>
              </ul>
              <Link className="btn btn-primary" to="/usersignup">
                Join the portal
              </Link>
            </div>

            <div className="col-12 col-lg-6">
              <div className="feature-media">
                <img src={mission} alt="Medical staff at work" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">What drives us</span>
            <h2>Built around three simple commitments</h2>
          </div>

          <div className="row g-3 g-md-4">
            {VALUES.map((value) => (
              <div className="col-12 col-md-4" key={value.title}>
                <div className="tile-card">
                  <span className="tile-icon">{value.icon}</span>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our team</span>
            <h2>The people behind LifeCare Portal</h2>
            <p>
              A final-year project team that wanted to build something people
              would actually reach for in a crisis.
            </p>
          </div>

          <div className="row g-3 g-md-4">
            {TEAM.map((member) => (
              <div className="col-6 col-lg-3" key={member.name}>
                <div className="doctor-card">
                  <img src={member.photo} alt={member.name} />
                  <div className="doctor-name-card">
                    <span className="doctor-role">{member.role}</span>
                    <p className="doctor-name">{member.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
