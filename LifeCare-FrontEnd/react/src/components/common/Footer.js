import React from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";
import { IconMail, IconPin } from "./Icons";
import { CONTACT_ADDRESS_LINES, CONTACT_EMAIL } from "./contactDetails";

// The services moved up to the navbar; the footer carries the company links.
const COMPANY = [
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="lc-footer">
      <div className="container">
        {/* Three equal columns, each a visually separated section. */}
        <div className="lc-footer-grid">
          <section className="lc-footer-col">
            <div className="lc-footer-brand">
              <img src={logo} alt="" />
              LifeCare
            </div>
            <p className="lc-footer-tagline">
              Find hospital beds, blood, oxygen and specialists near you — and
              book them in minutes, not hours.
            </p>
          </section>

          <section className="lc-footer-col">
            <h3>Company</h3>
            <ul>
              {COMPANY.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="lc-footer-col">
            <h3>Get in touch</h3>
            <ul className="lc-footer-contact">
              <li>
                <IconPin size={16} />
                <address>
                  {CONTACT_ADDRESS_LINES.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              </li>
              <li>
                <IconMail size={16} />
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
            </ul>
          </section>
        </div>

        <div className="lc-footer-bottom">
          © {new Date().getFullYear()} LifeCare Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
