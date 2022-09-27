import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

var i;
class AddDoctorinfo extends Component {
  constructor(props) {
    super(props);
    this.i = 0;
    this.state = {
      name: "",
      email: "",
      qualification: "",
      specialization: "",
      message: null,
    };

    this.saveDoctorinfo = this.saveDoctorinfo.bind(this);
    this.loadhospital = this.loadhospital.bind(this);
  }

  componentDidMount() {
    this.loadhospital();
  }

  loadhospital() {
    let hosp = JSON.parse(sessionStorage.getItem("hospital"));
    console.log(hosp.id);
    i = hosp.id;
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  saveDoctorinfo = (e) => {
    if (
      this.state.name === "" ||
      this.state.email === "" ||
      this.state.qualification === "" ||
      this.state.specialization === ""
    ) {
      Swal.fire({
        title: "All Fields are Mandatory",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    e.preventDefault();
    let doctor = {
      name: this.state.name,
      email: this.state.email,
      qualification: this.state.qualification,
      specialization: this.state.specialization,
    };

    HospitalServiceApi.addDoctorinfo(i, doctor).then((res) => {
      this.setState({ message: "Doctor details added successfully." });
      console.log(this.state.message);
      Swal.fire({
        title: this.state.message,
        icon: "success",
        confirmButtonText: "Ok",
      });
      window.location = "/hospitaldashboard";
    });
  };

  validateEmail() {
    let email = document.getElementById("email").value;

    var regexEmail = /\S+@\S+\.\S+/;
    if (regexEmail.test(email) === true) {
      document.getElementById("emailVr").innerHTML = "";
      return true;
    } else {
      document.getElementById("emailVr").innerHTML =
        "Email format should be in 'abc@gmail.com' !!!";
    }
  }

  removeWarnings() {
    document.getElementById("emailVr").innerHTML = "";
  }

  // backtodash() {
  //   window.location = "/hospitaldashboard";
  // }

  render() {
    return (
      <>
        <div className="container w-100% hospitaldash">
          <div className="row pt-3">
          <div className="col-sm-6">
          <h2 className="text-capitalize text-dark offset-1">Add Doctor Info</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-10 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>
          
          <form className="mb-5">
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="name" className="col-3 col-form-label fs-5 fw-bold">
                Name
                </label>
                <div className="col-5 p-1">
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  placeholder="Name"
                  name="name"
                  value={this.state.name}
                  onChange={this.onChange}
                  onBlur={this.validateinput}
                  onFocus={this.removeWarnings}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="email" className="col-3 col-form-label fs-5 fw-bold">
                Email
                </label>
                <div className="col-5 p-1">
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Email"
                  name="email"
                  value={this.state.email}
                  onChange={this.onChange}
                  onFocus={this.removeWarnings}
                  onBlur={this.validateEmail}
                  required
                />
                <p className="text-center mt-3" style={{ color: "red" }} id="emailVr"></p>
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="qualification" className="col-3 col-form-label fs-5 fw-bold">
                Qualification
                </label>
                <div className="col-5 p-1">
                <input
                  type="text"
                  id="qualification"
                  className="form-control"
                  placeholder="Qualification"
                  name="qualification"
                  value={this.state.qualification}
                  onChange={this.onChange}
                  required
                />
          </div>          
		  </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="specialization" className="col-3 col-form-label fs-5 fw-bold">
                Specialization
                </label>
                <div className="col-5 p-1">
                <input
                  type="text"
                  id="specialization"
                  className="form-control"
                  placeholder="Specialization"
                  name="specialization"
                  value={this.state.specialization}
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
                    onClick={this.saveDoctorinfo}
                  >
                    Add Doctor
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

export default AddDoctorinfo;
