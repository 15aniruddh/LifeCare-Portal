import { Link } from "react-router-dom";

import doctorHero from "../../assets/images/doctor1.webp";
import telemedicine from "../../assets/images/doctor3.webp";
import wellness from "../../assets/images/waitingroom.webp";
import testimonialImg from "../../assets/images/doctor.webp";

import {
  IconAmbulance,
  IconArrowRight,
  IconBed,
  IconCheck,
  IconClock,
  IconDroplet,
  IconHeart,
  IconOxygen,
  IconQuote,
  IconSearch,
  IconShield,
  IconStethoscope,
} from "./Icons";

const SERVICES = [
  {
    icon: <IconBed />,
    title: "Hospital beds",
    text: "Check live bed availability across partner hospitals and reserve one in a few taps.",
  },
  {
    icon: <IconDroplet />,
    title: "Blood bank",
    text: "Search every blood group across nearby hospitals and see what is in stock right now.",
  },
  {
    icon: <IconOxygen />,
    title: "Oxygen supply",
    text: "Locate available oxygen cylinders and concentrators when every minute counts.",
  },
  {
    icon: <IconStethoscope />,
    title: "Specialists",
    text: "Browse doctors by hospital and speciality, with their timings and contact details.",
  },
  {
    icon: <IconAmbulance />,
    title: "Ambulance",
    text: "Reach verified ambulance contacts for each hospital without hunting for a number.",
  },
  {
    icon: <IconHeart />,
    title: "General care",
    text: "Track your requests end to end and get a clear answer from the hospital, fast.",
  },
];

const STATS = [
  { value: "1,500+", label: "Families helped" },
  { value: "40+", label: "Partner hospitals" },
  { value: "24/7", label: "Support available" },
];

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-6">
              <span className="eyebrow">
                <IconHeart size={15} />
                Trusted healthcare access
              </span>
              <h1>
                Find care that&nbsp;
                <span className="text-accent">fits your needs</span> — right
                when you need it
              </h1>
              <p className="hero-lead">
                LifeCare Portal brings hospital beds, blood, oxygen and
                specialists into one place, so you spend your time on care
                instead of phone calls.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary btn-lg" to="/usersignup">
                  Get started
                </Link>
                <Link className="btn btn-outline-primary btn-lg" to="/about">
                  Learn more
                </Link>
              </div>

              <div className="hero-stats">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <span className="hero-stat-value">{stat.value}</span>
                    <span className="hero-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="hero-media">
                <img
                  src={doctorHero}
                  alt="A doctor reviewing a patient's chart"
                />
                <div className="floating-card floating-card-bottom-left">
                  <div className="floating-card-title">Availability today</div>
                  <div className="stat-row">
                    <span className="stat-label">ICU beds</span>
                    <span className="stat-value">28</span>
                  </div>
                  <div className="stat-bar">
                    <span style={{ width: "72%" }} />
                  </div>
                  <div className="stat-row mt-2">
                    <span className="stat-label">Oxygen units</span>
                    <span className="stat-value">64</span>
                  </div>
                  <div className="stat-bar">
                    <span style={{ width: "88%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Services</span>
            <h2>
              Everything you need for urgent care, in one portal
            </h2>
            <p>
              Search what is available, request it from the hospital, and follow
              your request until it is confirmed.
            </p>
          </div>

          <div className="row g-3 g-md-4">
            {SERVICES.map((service) => (
              <div className="col-12 col-sm-6 col-lg-4" key={service.title}>
                <div className="tile-card">
                  <span className="tile-icon">{service.icon}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Split feature panels */}
      <section className="section-tight">
        <div className="container">
          <div className="feature-panel">
            <div className="row align-items-center g-4 g-lg-5">
              <div className="col-12 col-lg-6">
                <span className="eyebrow">
                  <IconSearch size={15} />
                  Live search
                </span>
                <h2>
                  Real-time <span className="text-accent">availability</span>{" "}
                  across hospitals
                </h2>
                <ul className="check-list">
                  <li>
                    <IconCheck />
                    <span>Beds, blood groups and oxygen updated by hospitals</span>
                  </li>
                  <li>
                    <IconCheck />
                    <span>Filter by hospital so you can compare at a glance</span>
                  </li>
                  <li>
                    <IconCheck />
                    <span>No sign-in needed to browse what is available</span>
                  </li>
                </ul>
                <Link className="btn btn-primary" to="/bedavailability">
                  Check availability
                </Link>
              </div>
              <div className="col-12 col-lg-6">
                <div className="feature-media">
                  <img src={telemedicine} alt="A doctor consulting a patient" />
                </div>
              </div>
            </div>
          </div>

          <div className="feature-panel">
            <div className="row align-items-center g-4 g-lg-5 flex-lg-row-reverse">
              <div className="col-12 col-lg-6">
                <span className="eyebrow">
                  <IconClock size={15} />
                  Faster answers
                </span>
                <h2>
                  Book a bed and{" "}
                  <span className="text-accent">track the response</span>
                </h2>
                <ul className="check-list">
                  <li>
                    <IconCheck />
                    <span>Send a booking request straight to the hospital</span>
                  </li>
                  <li>
                    <IconCheck />
                    <span>See approvals and rejections in your dashboard</span>
                  </li>
                  <li>
                    <IconCheck />
                    <span>Keep a full history of every request you make</span>
                  </li>
                </ul>
                <Link className="btn btn-primary" to="/usersignup">
                  Create an account
                </Link>
              </div>
              <div className="col-12 col-lg-6">
                <div className="feature-media">
                  <img src={wellness} alt="A hospital waiting area" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Testimonial */}
      <section className="section-tight">
        <div className="container">
          <div className="mb-4">
            <span className="eyebrow">Testimonial</span>
            <h2 style={{ maxWidth: "34rem" }}>
              We have helped 1500+ families nationwide in health
            </h2>
          </div>

          <div className="testimonial-panel">
            <div className="row align-items-center g-4">
              <div className="col-12 col-lg-5">
                <div className="testimonial-media">
                  <img src={testimonialImg} alt="A patient with their family" />
                </div>
              </div>
              <div className="col-12 col-lg-7">
                <div className="px-lg-4">
                  <IconQuote size={34} />
                  <p className="testimonial-quote">
                    A calmness fills my soul, like the peaceful mornings of
                    spring. Finding a bed took minutes instead of an entire
                    night of phone calls — the care here has truly transformed
                    my life.
                  </p>
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div>
                      <p className="testimonial-author">Johnathan</p>
                      <span className="testimonial-author-role">
                        Diabetes patient
                      </span>
                    </div>
                    <Link
                      to="/about"
                      className="btn btn-on-violet btn-circle"
                      aria-label="Read more stories"
                    >
                      <IconArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA band */}
      <section className="section">
        <div className="container">
          <div className="cta-panel">
            <span className="eyebrow eyebrow-on-dark">
              <IconShield size={15} />
              Ready when you are
            </span>
            <h2>Create your account and book care in minutes</h2>
            <p>
              Registration is free. Sign up once and every hospital on the
              portal is a search away.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Link className="btn btn-accent btn-lg" to="/usersignup">
                Sign up free
              </Link>
              <Link className="btn btn-on-violet btn-lg" to="/contact">
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
