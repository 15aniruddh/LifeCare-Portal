import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import RequestServiceApi from "../service/RequestServiceApi.js";
var i = 0;
var j = 0;
export default class Userbedbook extends Component {
  constructor(props) {
    super(props);
    this.i = 0;

    this.state = {
      bedtype: "",
      symptoms: "",
      timetoarrive: "",
      status: "",
      message: null,
    };
    this.saveRequest = this.saveRequest.bind(this);
    this.loadUser = this.loadUser.bind(this);
  }

  componentDidMount() {
    this.loadUser();
  }

  loadUser() {
    let user = JSON.parse(sessionStorage.getItem("user"));
    console.log(user.id);
    i = user.id;
    let id = JSON.parse(sessionStorage.getItem("id"));
    console.log("hospid" + id);
    console.log(typeof id);
    j = id;
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  saveRequest = (e) => {
    if (
      this.state.bedtype === "" ||
      this.state.symptoms === "" ||
      this.state.timetoarrive === ""
    ) {
      Swal.fire({
        title: "All Fields are Mandatory",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    e.preventDefault();
    let request = {
      bedtype: this.state.bedtype,
      symptoms: this.state.symptoms,
      timetoarrive: this.state.timetoarrive,
      status: "pending",
    };
    console.log("userid " + i);
    console.log("hospid=" + j);

    console.log(request);

    RequestServiceApi.addRequest(i, j, request).then((res) => {
      this.setState({ message: "Request send successfully." });
      console.log(this.state.message);
      Swal.fire({
        title: this.state.message,
        icon: "success",
        confirmButtonText: "Ok",
      });
      window.location = "/userdashboard";
    });
  };
  // goback() {
  //   window.location = "/bedavailability";
  // }
  render() {
    return (
    <>  
    <div className="container w-100% userdash">
          <div className="row pt-3">
          <div className="col-sm-6">
          <h2 className="text-capitalize text-dark offset-1">Bed Booking</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-10 fw-bold" to="/bedavailability">Back</Link> 
          </div>
          
          <form className="mb-5">
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="bedtype" className="col-2 col-form-label fs-5 fw-bold text-dark">
                Type of Bed
                </label>
                <div className="col-5 p-1">
                <select
                id="bedtype"
                className="form-select"
                name="bedtype"
                value={this.state.bedtype}
                onChange={this.onChange}
                required
              >
                <option value="">Select the type of Bed</option>
                <option value="ventilator">Bed with Ventilator</option>
                <option value="oxygen">Bed with Oxygen Cylinder</option>
                <option value="normal">Normal Bed</option>
              </select>
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="symptoms" className="col-2 col-form-label fs-5 fw-bold text-dark">
                Symptoms
                </label>
                <div className="col-5 p-1">
                <input
                  type="text"
                  id="symptoms"
                  className="form-control"
                  placeholder="Symptoms"
                  name="symptoms"
                  value={this.state.symptoms}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="timetoarrive" className="col-2 col-form-label fs-5 fw-bold text-dark">
                Time of Arrival
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="timetoarrive"
                  className="form-control"
                  placeholder="Time of Arrival (Days)"
                  name="timetoarrive"
                  value={this.state.timetoarrive}
                  onChange={this.onChange}
                  required
                />
          </div>          
		  </div>
      <br />
              <div className="form-group justify-content-center">
                <div className="offset-5">
                  <Button
                    className="btn btn btn-primary mt-3 fw-bold"
                    onClick={this.saveRequest}>
                    Book Bed
                  </Button>
                </div>
              </div>
              </form>
      </div>
      </div>
    </>  
    );
  }
}
