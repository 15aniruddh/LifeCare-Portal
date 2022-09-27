import React from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import logo from "../images/logo.png";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      <Navbar bg="primary" sticky="top" variant="dark">
        <Container direction="horizontal" gap={3}>
        <h2><Navbar.Brand>
          <Link to="/"><img src={logo} width="40" height="40" alt="logo" /></Link>
            &nbsp;LifeCare Portal
          </Navbar.Brand></h2>
          <Nav className="me-auto">
            <h4><Link to="/"><Button variant="primary"><h5 className="pt-2">Home</h5></Button></Link></h4>
            <h4><Link to="/about"><Button variant="primary"><h5 className="pt-2">About</h5></Button></Link></h4>
            <h4><Link to="/contact"><Button variant="primary"><h5 className="pt-2">Contact</h5></Button></Link></h4>            
          </Nav>    
          <form className="d-flex">
            <h4><Link to="/login"><Button variant="danger"><h5 className="pt-2">Login</h5></Button></Link></h4>&nbsp;&nbsp;&nbsp;
            <h4><Link to="/usersignup"><Button variant="danger"><h5 className="pt-2">Sign Up</h5></Button></Link></h4>
          </form>      
        </Container>        
      </Navbar>
    </>
  );
}
