import React, { Component } from "react";
import { Button, Card, Row, form } from "react-bootstrap";
import { Link } from "react-router-dom";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

class HospitalDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hospitalId: "",
      Name: "",
    };

    this.loadHospital = this.loadHospital.bind(this);
  }

  componentDidMount() {
    this.loadHospital();
  }

  loadHospital = () => {
    let hospital = JSON.parse(sessionStorage.getItem("hospital"));
    this.setState({
      hospitalId: hospital.id,
      Name: hospital.name,
    });
  };

  logout() {
    HospitalServiceApi.logoutHospital();
    window.location = "/";
  }

  // addbed() {
  //   window.location = "/addbed";
  // }
  // addblood() {
  //   window.location = "/addblood";
  // }
  // addoxygen() {
  //   window.location = "/addoxygen";
  // }
  // adddoctorinfo() {
  //   window.location = "/adddoctorinfo";
  // }
  // bedlist() {
  //   window.location = "/bedlist";
  // }
  // bloodlist() {
  //   window.location = "/bloodlist";
  // }
  // oxygenlist() {
  //   window.location = "/oxygenlist";
  // }
  // doctorinfolist() {
  //   window.location = "/doctorinfolist";
  // }
  // viewrequest() {
  //   window.location = "/viewrequest";
  // }
  // approverejectequest() {
  //   window.location = "/approverejectrequest";
  // }


  render() {
    let { hospitalId, Name } = this.state;
    return (
    <>  
      <div className="container w-100%">
      <div className="d-flex hospitaldash">
      <div className="row pt-3">
        <div className="col-sm-6">
          <h2 className="text-capitalize text-secondary offset-1">Welcome, {Name}</h2>
        </div>
        <div className="col-sm-6">
          <Link className="btn btn-danger offset-9 fw-bold" onClick={this.logout}>Logout</Link>  
          {/* <Link className="btn btn-danger offset-9 fw-bold" to={'/'}>Logout</Link>   */}
        </div>
      
        <form>
      <br />
        <Row>
  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">Add Bed</Card.Title>
      <Card.Text>
      Add bed details to database.
      </Card.Text>
      <Link className="btn btn-primary fw-bold" variant="primary" to="/addbed">Add</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">View Bed List</Card.Title>
      <Card.Text>
      View details of all Beds in Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/bedlist">View</Link>
    </Card.Body>
  </Card>
  </Row>

  <br />

  <Row>
  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">Add Blood</Card.Title>
      <Card.Text>
      Add Blood details of Hospital's.
      </Card.Text>
      <Link className="btn btn-primary fw-bold" variant="primary" to="/addblood">Add</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">View Blood List</Card.Title>
      <Card.Text>
      View details of all Blood in Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/bloodlist">View</Link>
    </Card.Body>
  </Card>
  </Row>

  <br />

  <Row>
  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">Add Oxygen Cylinder</Card.Title>
      <Card.Text>
      Add Oxygen Cylinder details of Hospital's.
      </Card.Text>
      <Link className="btn btn-primary fw-bold" variant="primary" to="/addoxygen">Add</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">View Oxygen Cylinder List</Card.Title>
      <Card.Text>
      View details of all Oxygen Cylinder in Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/oxygenlist">View</Link>
    </Card.Body>
  </Card>
  </Row>

  <br />


  <Row>
  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">Add Doctor Info</Card.Title>
      <Card.Text>
      Add Doctor details of Hospital's.
      </Card.Text>
      <Link className="btn btn-primary fw-bold" variant="primary" to="/adddoctorinfo">Add</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">View Doctor Info List</Card.Title>
      <Card.Text>
      View details of all Blood in Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/doctorinfolist">View</Link>
    </Card.Body>
  </Card>
  </Row>

  <br />

  <Row>
  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">Action on Request</Card.Title>
      <Card.Text>
      Approve or Reject the Requests.
      </Card.Text>
      <Link className="btn btn-primary fw-bold" variant="primary" to="/approverejectrequest">Action</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-3">View Request</Card.Title>
      <Card.Text>
      View Request details of Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/viewrequest">View</Link>
    </Card.Body>
  </Card>
  </Row>
  <br />
  </form>
      </div>      
    </div>
    </div>
  </>
    );
  }
}

export default HospitalDashboard;
