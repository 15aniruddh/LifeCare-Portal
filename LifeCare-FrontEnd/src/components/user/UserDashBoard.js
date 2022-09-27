import React, { Component } from "react";
import { Card, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import UserServiceApi from "../service/UserServiceApi.js";

class UserDashBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: "",
      Name: "",
    };

    this.loadUser = this.loadUser.bind(this);
  }

  componentDidMount() {
    this.loadUser();
  }

  loadUser = () => {
    let user = JSON.parse(sessionStorage.getItem("user"));
    this.setState({
      userId: user.id,
      Name: user.name,
    });
  };

  logout() {
    UserServiceApi.logoutUser();
    window.location = "/";
  }

  // bedbook() {
  //   window.location = "/bedavailability";
  // }
  // bloodavailability() {
  //   window.location = "/bloodavailability";
  // }
  // oxygenavailability() {
  //   window.location = "/oxygenavailability";
  // }
  // bookingstatus() {
  //   window.location = "/bookingstatus";
  // }
  // ambulancecontact() {
  //   window.location = "/ambulancecontact";
  // }
  // doctorinfo() {
  //   window.location = "/doctorinfo";
  // }


  render() {
    let { userId, Name } = this.state;
    return (
      <>  
      <div className="container w-100%">
      <div className="d-flex userdash">
      <div className="row pt-3">
        <div className="col-sm-6">
          <h2 className="text-capitalize text-dark offset-1">Welcome, {Name}</h2>
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
      <Card.Title className="fs-4">Book Bed</Card.Title>
      <Card.Text>
      Book bed in the Hospital.
      </Card.Text>
      <Link className="btn btn-primary fw-bold" variant="primary" to="/bedavailability">Add</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-4">View Blood Availability</Card.Title>
      <Card.Text>
      View Blood Availability in the Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/bloodavailability">View</Link>
    </Card.Body>
  </Card>
  </Row>

  <br />

  <Row>
  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-4">View Booking Status</Card.Title>
      <Card.Text>
      View Booking History.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/bookingstatus">View</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-4">View Oxygen Availability</Card.Title>
      <Card.Text>
      View Oxygen Cylinder Availability in the Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/oxygenavailability">View</Link>
    </Card.Body>
  </Card>
  </Row>

  <br />

  <Row>
  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-4">View Ambulance Contact Details</Card.Title>
      <Card.Text>
      View Ambulance Contact Details of the Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/ambulancecontact">View</Link>
    </Card.Body>
  </Card>

  <Card className="m-auto" style={{ width: '26rem' }}>
    <Card.Body>
      <Card.Title className="fs-4">View Doctor Info Details</Card.Title>
      <Card.Text>
      View Doctors Info Available at the Hospital's.
      </Card.Text>
      <Link className="btn btn-warning fw-bold" variant="warning" to="/doctorinfo">View</Link>
    </Card.Body>
  </Card>
  </Row>
  <br />
  <br />
  </form>
      </div>      
    </div>
    </div>
  </>
    );
  }
}

export default UserDashBoard;
