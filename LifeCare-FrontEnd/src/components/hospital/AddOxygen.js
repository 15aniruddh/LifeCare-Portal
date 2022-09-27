import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

var i;
class AddOxygen extends Component {
  constructor(props) {
    super(props);
    this.i = 0;
    this.state = {
      oxygenavailable: "",
      message: null,
    };

    this.saveOxygen = this.saveOxygen.bind(this);
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

  saveOxygen = (e) => {
    if (this.state.oxygenavailable === "") {
      Swal.fire({
        title: "All Fields are Mandatory",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    e.preventDefault();
    let hospital = {
      oxygenavailable: this.state.oxygenavailable,
    };
    console.log(i);

    console.log(hospital);

    HospitalServiceApi.addOxygen(i, hospital).then((res) => {
      this.setState({ message: "Oxygen details updated successfully." });
      console.log(this.state.message);
      Swal.fire({
        title: this.state.message,
        icon: "success",
        confirmButtonText: "Ok",
      });
      window.location = "/hospitaldashboard";
    });
  };

  // backtodash() {
  //   window.location = "/hospitaldashboard";
  // }
  render() {
    return (
      <>
        <div className="container w-100% hospitaldash">
          <div className="row pt-3">
          <div className="col-sm-6">
          <h2 className="text-capitalize text-dark offset-1">Add Oxygen Cylinder</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-10 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>
          
          <form className="mb-5">
          <br />
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="oxygenavailable" className="col-4 col-form-label fs-4 fw-bold">
                Oxygen Cylinder Available
                </label>
                <div className="col-5 p-2">
                <input
                  type="number"
                  id="oxygenavailable"
                  className="form-control"
                  placeholder="Oxygen Available"
                  name="oxygenavailable"
                  value={this.state.oxygenavailable}
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
                    onClick={this.saveOxygen}
                  >
                    Add Oxygen Cylinder
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

export default AddOxygen;
