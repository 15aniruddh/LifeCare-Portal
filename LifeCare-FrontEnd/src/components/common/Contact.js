import React from "react";
import { Badge } from "react-bootstrap";

export default function Contact() {
  return (
    <>
      <div className="container">
      <br />
      <h2>
        You can get in touch from following
        <hr />
        <br />
        <u>Address:</u>
      </h2>
      <h4>
        <p>
          National Health Authority
          <br />
          9th Floor, Tower-l, Jeevan Bharati Building,
          <br />
          Connaught Place,
          <br />
          New Delhi - 110001
          <br />
        </p>
      </h4>
      <br />
      <h2>
      <u>Contact:</u>
      </h2>
      <h4>
        <p>Call us at 1800-11-4477 / 14477 (Toll-free)</p>
      </h4>
      <br />
      <h2>
      <u>Email:</u>
      </h2>
      <h4>
        <p>lifecareportal@mail.com &nbsp;<Badge bg="success">Active</Badge></p>        
      </h4>
      </div>
    </>
  );
}
