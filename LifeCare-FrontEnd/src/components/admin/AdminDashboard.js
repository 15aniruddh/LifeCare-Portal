import React, { Component } from "react";
import { Card, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import AdminServiceApi from "../service/AdminServiceApi.js";

class Admin extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      adminId: "",
      firstName: "",
    };

    this.loadAdmin = this.loadAdmin.bind(this);
  }

  componentDidMount() {
    this.loadAdmin();
  }

  loadAdmin = () => {
    let admin = JSON.parse(sessionStorage.getItem("admin"));
    this.setState({
      adminId: admin.id,
      firstName: admin.name,
    });
  };

  logout() {
    AdminServiceApi.logoutAdmin();    
    window.location = "/";
  };

  // addhospital() {
  //   window.location = "/addhospital";
  // }

  // viewhospital() {
  //   window.location = "/viewhospital";
  // }

  // viewusers() {
  //   window.location = "/viewuser";
  // }

  render() {
    let { adminId, firstName } = this.state;
    return (

      <div className="container w-100%">
        <div className="d-flex admindash">
        <div className="row pt-3">
          <div className="col-sm-6">
            <h2 className="text-capitalize text-light offset-1">Welcome, {firstName}</h2>
          </div>
          <div className="col-sm-6">
            <Link className="btn btn-danger offset-9 fw-bold" onClick={this.logout}>Logout</Link>  
            {/* <Link className="btn btn-danger offset-9 fw-bold" to={'/'}>Logout</Link>   */}
          </div>

          <Row>
		<Card className="m-auto" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title className="fs-3">Add Hospital</Card.Title>
        <Card.Text>
        Register new Hospital to database.
        </Card.Text>
        <Link className="btn btn-primary fw-bold" variant="primary" to="/addhospital">Add</Link>
      </Card.Body>
    </Card>

		<Card className="m-auto" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title className="fs-3">View Hospital List</Card.Title>
        <Card.Text>
        View details of all registered Hospital's.
        </Card.Text>
        <Link className="btn btn-warning fw-bold" variant="warning" to="/viewhospital">View</Link>
      </Card.Body>
    </Card>

		<Card className="m-auto" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title className="fs-3">View User List</Card.Title>
        <Card.Text>
        View details of all registered User's.
        </Card.Text>
        <Link className="btn btn-warning fw-bold" variant="warning" to="/viewuser">View</Link>
      </Card.Body>
    </Card>
    </Row>
        </div>        
      </div>
      </div>
    );
  }
}


export default Admin;
