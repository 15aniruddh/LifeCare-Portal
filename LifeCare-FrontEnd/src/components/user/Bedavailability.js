import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import HospitalServiceApi from "../service/HospitalServiceApi.js";
var id = 0;
export default class Bedavailability extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hospid: "",
      hospitalname: "",
      ventilator: "",
      oxygen: "",
      normal: "",
      message: null,
    };

    this.search = this.search.bind(this);
    this.onChange = this.onChange.bind(this);
    this.gotobedbook = this.gotobedbook.bind(this);
  }

  search = (e) => {
    if (this.state.hospitalname === "") {
      Swal.fire({
        //title: "Warning",
        text: "Please Enter the Hospital Name",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    e.preventDefault();

    HospitalServiceApi.getByHospname(this.state.hospitalname).then(
      (response) => {
        console.log(this.state.hospitalname);
        let hospital = response.data;
        this.setState({
          hospid: hospital.hospid,
          ventilator: hospital.ventilator,
          oxygen: hospital.oxygen,
          normal: hospital.normal,
          message: "Hospitals list rendered successfully",
        });
        id = hospital.hospid;
        sessionStorage.setItem("id", hospital.hospid);
        console.log(this.state.hospid);
      }
    );
  };

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  validateinput() {
    let hospname = document.getElementById("hospitalname").value;
    if (hospname === "") {
      document.getElementById("searchVl").innerHTML =
        "Please Enter Hospital Name";
      return true;
    }
  }
  removeWarnings() {
    document.getElementById("searchVl").innerHTML = "";
  }

  // backtodash() {
  //   window.location = "/userdashboard";
  // }
  gotobedbook() {
    if (this.state.ventilator === "") {
      Swal.fire({
        title: "Warning",
        text: "Please Enter the Hospital Name",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    window.location = "/userbedbook";
  }

  render() {
    return (
      <>
        <div className="container w-100%">
          <div className="row pt-3">
          <div className="col-sm-6">
            <h2 className="text-capitalize text-dark ">Available Bed Quantity</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/userdashboard">Back</Link> 
          </div>

          <form>
            <div className="form-group row mt-3 justify-content-center">
              <label htmlFor="hospitalname" className="col-2 col-form-label fs-5 fw-bold">
                Hospital Name
              </label>
              <div className="col-5 p-1">
                <input
                  type="text"
                  id="hospitalname"
                  className="form-control"
                  placeholder="Hospital Name"
                  name="hospitalname"
                  value={this.state.hospitalname}
                  onChange={this.onChange}
                  onBlur={this.validateinput}
                  onFocus={this.removeWarnings}
                  required
                />
                <p className="text-center mt-3" style={{ color: "red" }} id="searchVl"></p>
              </div>
            </div>
            <Button className="btn btn-primary fs-5 fw-bold offset-6" onClick={this.search}>
              Search
            </Button>
          </form>





          <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="col-4 text-center fs-5">Hospital Name</th>
                    <th className="col-2 text-center fs-5">Bed with Ventilator</th>
                    <th className="col-3 text-center fs-5">Bed with Oxygen Cylinder</th>
                    <th className="col-2 text-center fs-5">Normal Bed</th>
                    <th className="col-1 text-center fs-5">Action</th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td className="col-4 text-center fs-5 fw-bold">{this.state.hospitalname}</td>
                      <td className="col-2 text-center fs-5 fw-bold">{this.state.ventilator}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{this.state.oxygen}</td>
                      <td className="col-2 text-center fs-5 fw-bold">{this.state.normal}</td>
                      <td className="col-1 text-center fs-5 fw-bold">                     
                        <Button onClick={this.gotobedbook} className="btn btn-primary fs-6 fw-bold">Book</Button>
                      </td>
                    </tr>
                </tbody>
              </table>
            </div>
          </div>
          <br />
        </div>
      </>
    );
  }
}
