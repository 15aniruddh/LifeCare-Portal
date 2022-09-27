import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import AdminServiceApi from "../service/AdminServiceApi.js";
import { Link } from "react-router-dom";


class AddHospital extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hospitalname: "",
      email: "",
      password: "",
      contact: "",
      address: "",
      ambulancecontact: "",
      message: null,
    };
    this.addHospital = this.addHospital.bind(this);
  }

  validatehospitalname() {
    let hospname = document.getElementById("hospitalname").value;
    if (hospname === "") {
      document.getElementById("nameVr").innerHTML =
        "Please Enter Hospital Name here !!!";
      return true;
    }
  }

  validateAddress() {
    let hospname = document.getElementById("hospitalname").value;
    if (hospname === "") {
      document.getElementById("addressVr").innerHTML =
        "Please Enter the Address !!!";
      return true;
    }
  }

  validatePassword() {
    let password = document.getElementById("pwd").value;
    var regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{5,}$/;

    if (regexPassword.test(password) === true) {
      document.getElementById("passwordVr").innerHTML = "";
      return true;
    } else {
      document.getElementById("passwordVr").innerHTML =
        "Password must be in alphanumeric and should contains at least a special character with length 5 !!!";
    }
  }

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

  validateAMContactNumber() {
    let number = document.getElementById("ambulancecontact").value;
    var regexMobile = /^\d{10}$/;
    if (regexMobile.test(number)) {
      document.getElementById("amcontactv").innerHTML = "";
    } else {
      document.getElementById("amcontactv").innerHTML =
        "Phone number must be of 10 digits !!!";
      return false;
    }
  }

  validateMobileNumber() {
    let number = document.getElementById("contact").value;
    var regexMobile = /^\d{10}$/;
    if (regexMobile.test(number)) {
      document.getElementById("contactVr").innerHTML = "";
    } else {
      document.getElementById("contactVr").innerHTML =
        "Phone number must be of 10 digits !!!";
      return false;
    }
  }

  removeWarnings() {
    document.getElementById("passwordVr").innerHTML = "";
    document.getElementById("emailVr").innerHTML = "";
    document.getElementById("amcontactv").innerHTML = "";
    document.getElementById("contactVr").innerHTML = "";
    document.getElementById("nameVr").innerHTML = "";
    document.getElementById("addressVr").innerHTML = "";
  }

  addHospital = (h) => {
    if (
      this.state.hospitalname === "" ||
      this.state.email === "" ||
      this.state.password === "" ||
      this.state.contact === "" ||
      this.state.address === "" ||
      this.state.ambulancecontact === ""
    ) {
      Swal.fire({
        title: "All Fields are Mandatory",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    var regexEmail = /\S+@\S+\.\S+/;
    if (regexEmail.test(this.state.email) === false) {
      Swal.fire({
        title: "Enter valid email",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    var regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{5,}$/;
    if (regexPassword.test(this.state.password) === false) {
      Swal.fire({
        title: "Enter valid password",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    var regexContact = /^\(?([2-9]{1})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{4})$/;
    if (regexContact.test(this.state.contact) === false) {
      Swal.fire({
        title: "Enter valid Contact Number",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    var regexMobile = /^\(?([7-9]{1})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{4})$/;
    if (regexMobile.test(this.state.ambulancecontact) === false) {
      Swal.fire({
        title: "Enter valid Ambulance Contact Number",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }

    h.preventDefault();
    let hospital = {
      hospitalname: this.state.hospitalname,
      email: this.state.email,
      password: this.state.password,
      contact: this.state.contact,
      address: this.state.address,
      ambulancecontact: this.state.ambulancecontact,
    };

    AdminServiceApi.addHospital(hospital)
      .then((res) => {
        console.log(res.data);
        this.setState({ message: "Hospital added successfully !!!" });
        console.log(this.state.message);
        Swal.fire({
          title: this.state.message,
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1500
        });
        window.location = "/admindashboard";
      })
      .catch((error) => {
        console.error("in err ", error.response.data);
        alert(error.response.data.message);
      });
  };

  onChange = (h) => this.setState({ [h.target.name]: h.target.value });

  // backtodash() {
  //   window.location = "/admindashboard";
  // }

  render() {
    return (
      <>
        <div className="container pl-2">
          <div className="container-fluid row signup justify-content-center">
          <div
            className="col-sm-8 overflow-hidden border border-primary rounded"
            style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            <div className="row py-3">
            
              <div className="col-sm-8 mx-3">  
              <br />              
                <h2 className="text-dark offset-3">Hospital Registration</h2>
              </div>
              <div className="col-sm-3">
              <br />
                <Link className="btn btn-dark offset-6 fw-bold" to="/admindashboard">Back</Link>
              </div>
            </div>
            <form className="mb-5">
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="name" className="col-3 col-form-label fw-bold">
                  Hospital Name
                </label>
                <div className="col-5">
                  <input
                    type="text"
                    id="hospitalname"
                    className="form-control"
                    placeholder="Enter your Hospital Name here !!!"
                    name="hospitalname"
                    value={this.state.hospitalname}
                    onChange={this.onChange}
                    onFocus={this.removeWarnings}
                    onBlur={this.validatehospitalname}
                    required
                  />
                  <p className="text-center mt-3" style={{ color: "red" }} id="nameVr"></p>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="email" className="col-3 col-form-label fw-bold">
                  Email
                </label>
                <div className="col-5">
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="abc@xyz.com"
                    name="email"
                    value={this.state.email}
                    onChange={this.onChange}
                    required
                    onFocus={this.removeWarnings}
                    onBlur={this.validateEmail}
                  />
                  <p className="text-center mt-3" style={{ color: "red" }} id="emailVr"></p>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="pwd" className="col-3 col-form-label fw-bold">
                  Password
                </label>
                <div className="col-5">
                  <input
                    type="password"
                    id="pwd"
                    className="form-control"
                    placeholder="Enter your Password here !!!"
                    name="password"
                    value={this.state.password}
                    onChange={this.onChange}
                    onBlur={this.validatePassword}
                    onFocus={this.removeWarnings}
                    required
                  />
                  <p className="text-center mt-3" style={{ color: "red" }} id="passwordVr"></p>
                </div>
              </div>
              
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="contact" className="col-3 col-form-label fw-bold">
                  Contact
                </label>
                <div className="col-5">
                  <input
                    type="phone"
                    id="contact"
                    className="form-control"
                    placeholder="Enter your Contact details here !!!"
                    name="contact"
                    value={this.state.contact}
                    onChange={this.onChange}
                    pattern="[0-9]{1}-[0-9]{5}-[0-9]{4}"
                    onBlur={this.validateMobileNumber}
                    onFocus={this.removeWarnings}
                    required
                  />
                  <p className="text-center mt-3" id="contactVr" style={{ color: "red" }}></p>
                </div>
              </div>

              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="contact" className="col-3 col-form-label fw-bold">
                  Ambulance Number
                </label>
                <div className="col-5">
                  <input
                    type="phone"
                    id="ambulancecontact"
                    className="form-control"
                    placeholder="Enter your Ambulance Number here !!!"
                    name="ambulancecontact"
                    value={this.state.ambulancecontact}
                    onChange={this.onChange}
                    pattern="[0-9]{1}-[0-9]{5}-[0-9]{4}"
                    onBlur={this.validateAMContactNumber}
                    onFocus={this.removeWarnings}
                    required
                  />
                  <p className="text-center mt-3" id="amcontactv" style={{ color: "red" }}></p>
                </div>
              </div>


              <div className="form-group row mt-3 justify-content-center">
                <label htmlFor="address" className="col-3 col-form-label fw-bold">
                  Address
                </label>
                <div className="col-5">
                  <textarea
                    rows="3"
                    id="address"
                    className="form-control"
                    placeholder="Enter your Address here !!!"
                    name="address"
                    value={this.state.address}
                    onChange={this.onChange}
                    onBlur={this.validateAddress}
                    onFocus={this.removeWarnings}
                    required>
                  </textarea>
                  <p className="text-center mt-3" style={{ color: "red" }} id="addressVr"></p>
                </div>
              </div>
              <br />
              <div className="form-group justify-content-center">
                <div className="offset-5">
                  <Button
                    className="btn btn btn-primary mt-3 fw-bold"
                    onClick={this.addHospital}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      </>
    );
  }
}

export default AddHospital;
