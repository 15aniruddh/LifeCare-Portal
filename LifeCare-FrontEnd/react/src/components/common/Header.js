import React, { useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import { IconLogout } from "./Icons";
import { clearSession } from "../service/httpAuth";

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

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
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
    <Navbar
      expand="lg"
      sticky="top"
      className="lc-navbar"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={closeMenu}>
          <img src={logo} alt="" />
          LifeCare
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="lc-main-nav" aria-label="Toggle menu" />

        <Navbar.Collapse id="lc-main-nav">
          <Nav className="me-auto">
            {PUBLIC_LINKS.map((link) => (
              <Nav.Link
                key={link.to}
                as={NavLink}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
              >
                {link.label}
              </Nav.Link>
            ))}
            {session && (
              <Nav.Link
                as={NavLink}
                to={session.dashboard}
                onClick={closeMenu}
                // The dashboard link should read as active on its sub-pages too.
                className={
                  location.pathname === session.dashboard ? "active" : undefined
                }
              >
                Dashboard
              </Nav.Link>
            )}
          </Nav>

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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
