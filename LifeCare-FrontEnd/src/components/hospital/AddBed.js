import React, { Component } from "react";
import { Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

var i;
class AddBed extends Component {
  constructor(props) {
    super(props);
    this.i = 0;
    this.state = {
      ventilator: "",
      oxygen: "",
      normal: "",
      message: null,
    };

    this.saveBed = this.saveBed.bind(this);
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

  saveBed = (e) => {
    if (
      this.state.ventilator === "" ||
      this.state.oxygen === "" ||
      this.state.normal === ""
    ) {
      Swal.fire({
        title: "All Fields are Mandatory",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }

    e.preventDefault();
    let hospital = {
      ventilator: this.state.ventilator,
      oxygen: this.state.oxygen,
      normal: this.state.normal,
    };
    console.log(i);

    console.log(hospital);
    console.log(typeof hospital.ventilator);
    console.log(typeof hospital.oxygen);
    console.log(typeof hospital.normal);

    HospitalServiceApi.addBed(i, hospital).then((res) => {
      this.setState({ message: "Bed details updated successfully." });
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
          <h2 className="text-capitalize text-dark offset-1">Add Bed</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-10 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>
          
          <form className="mb-5">
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="ventilator" className="col-3 col-form-label fs-5 fw-bold">
                Bed with Ventilator 
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="ventilator"
                  className="form-control"
                  placeholder="Bed with Ventilator"
                  name="ventilator"
                  value={this.state.ventilator}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="oxygen" className="col-3 col-form-label fs-5 fw-bold">
                Bed with Oxygen Cylinder
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="oxygen"
                  className="form-control"
                  placeholder="Bed with Oxygen Cylinder"
                  name="oxygen"
                  value={this.state.oxygen}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="normal" className="col-3 col-form-label fs-5 fw-bold">
                Normal Bed
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="normal"
                  className="form-control"
                  placeholder="Normal Bed"
                  name="normal"
                  value={this.state.normal}
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
                    onClick={this.saveBed}
                  >
                    Add Bed
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

export default AddBed;
