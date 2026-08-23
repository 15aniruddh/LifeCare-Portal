import React from "react";
import { Link } from "react-router-dom";
import { IconClock, IconMail, IconPin } from "./Icons";
import {
  CONTACT_ADDRESS_LINES,
  CONTACT_EMAIL,
  SUPPORT_HOURS_LINES,
} from "./contactDetails";

const CHANNELS = [
  {
    icon: <IconPin />,
    title: "Visit us",
    lines: CONTACT_ADDRESS_LINES,
  },
  {
    icon: <IconMail />,
    title: "Email us",
    lines: [CONTACT_EMAIL],
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: <IconClock />,
    title: "Support hours",
    lines: SUPPORT_HOURS_LINES,
  },
];

export default function Contact() {
  return (
    <>
      <section className="section-tight">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Contact</span>
            <h2>
              Get in touch with the <span className="text-accent">LifeCare</span>{" "}
              team
            </h2>
            <p>
              Questions about a booking, a hospital listing, or your account?
              Reach us on any of the channels below.
            </p>
          </div>

          <div className="row g-3 g-md-4 justify-content-center">
            {CHANNELS.map((channel) => (
              <div className="col-12 col-sm-6 col-lg-4" key={channel.title}>
                <div className="tile-card h-100">
                  <span className="tile-icon">{channel.icon}</span>
                  <h3>{channel.title}</h3>
                  <p>
                    {channel.lines.map((line, index) => (
                      <React.Fragment key={line}>
                        {index > 0 && <br />}
                        {channel.href && index === 0 ? (
                          <a href={channel.href}>{line}</a>
                        ) : (
                          line
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight pb-5">
        <div className="container">
          <div className="cta-panel">
            <h2>Are you a hospital that wants to list with us?</h2>
            <p>
              Hospitals on the portal publish their own bed, blood and oxygen
              availability. Write to us and we will get you set up.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <a
                className="btn btn-accent btn-lg"
                href={`mailto:${CONTACT_EMAIL}?subject=Hospital%20listing%20request`}
              >
                Email the team
              </a>
              <Link className="btn btn-on-violet btn-lg" to="/about">
                Learn about us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
