import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.webp";
import { IconLogout } from "./Icons";
import { clearSession } from "../../services/httpAuth";

/** Whoever is signed in, and where their dashboard lives. */
function readSession() {
  const roles = [
    { key: "admin", dashboard: "/admindashboard" },
    { key: "hospital", dashboard: "/hospitaldashboard" },
    { key: "user", dashboard: "/userdashboard" },
  ];

  for (const role of roles) {
    const raw = sessionStorage.getItem(role.key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      return {
        role: role.key,
        dashboard: role.dashboard,
        name: data?.name || data?.hospitalname || role.key,
      };
    } catch {
      // A corrupt entry should not take the whole navbar down.
      sessionStorage.removeItem(role.key);
    }
  }
  return null;
}

// Browsing availability is public, so every service is a top-level nav link.
const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/bedavailability", label: "Beds" },
  { to: "/bloodavailability", label: "Blood" },
  { to: "/oxygenavailability", label: "Oxygen" },
  { to: "/doctorinfo", label: "Doctors" },
  { to: "/ambulancecontact", label: "Ambulance" },
];

const navLinkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

export default function Header() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Re-read on every render so it reflects a login that just happened.
  const session = readSession();

  const closeMenu = () => setExpanded(false);

  const logout = () => {
    clearSession();
    closeMenu();
    navigate("/");
  };

  return (
    // Plain Bootstrap markup: below lg the toggle adds `show`, and at lg and up
    // `.navbar-expand-lg` keeps the panel open. Both are pure CSS, so the
    // navbar needs no JavaScript from Bootstrap itself.
    <nav className="navbar navbar-expand-lg sticky-top lc-navbar">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={closeMenu}>
          <img src={logo} alt="" />
          LifeCare
        </Link>

        <button
          type="button"
          className="navbar-toggler"
          aria-controls="lc-main-nav"
          aria-expanded={expanded}
          aria-label="Toggle menu"
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          id="lc-main-nav"
          className={`collapse navbar-collapse${expanded ? " show" : ""}`}
        >
          <ul className="navbar-nav me-auto">
            {PUBLIC_LINKS.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  className={navLinkClass}
                  to={link.to}
                  end={link.end}
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {session && (
              <li className="nav-item">
                <NavLink
                  className={navLinkClass}
                  to={session.dashboard}
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          <div className="lc-nav-actions">
            {session ? (
              <>
                <span className="pill pill-neutral text-capitalize d-none d-lg-inline-block">
                  {session.name}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 justify-content-center"
                  onClick={logout}
                >
                  <IconLogout size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn btn-outline-secondary btn-sm"
                  to="/login"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  className="btn btn-primary btn-sm"
                  to="/usersignup"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
