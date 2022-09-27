import React, { Component } from "react";
import { Link } from "react-router-dom";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

class BloodList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hospitalname: "",
      a_pos: "",
      a_neg: "",
      b_pos: "",
      b_neg: "",
      ab_pos: "",
      ab_neg: "",
      o_pos: "",
      o_neg: "",
      message: null,
    };

    this.reloadHospitalList = this.reloadHospitalList.bind(this);
  }

  componentDidMount() {
    this.reloadHospitalList();
  }

  reloadHospitalList() {
    let hosp = JSON.parse(sessionStorage.getItem("hospital"));
    console.log(hosp.id);
    HospitalServiceApi.getHospitalById(hosp.id).then((resp) => {
      let hospital = resp.data;
      this.setState({
        hospitalname: hospital.hospitalname,
        a_pos: hospital.a_pos,
        a_neg: hospital.a_neg,
        b_pos: hospital.b_pos,
        b_neg: hospital.b_neg,
        ab_pos: hospital.ab_pos,
        ab_neg: hospital.ab_neg,
        o_pos: hospital.o_pos,
        o_neg: hospital.o_neg,
        message: "Hospitals list rendered successfully",
      });
      console.log(resp.data);
      console.log(this.state.message);
    });
  }

  // backtodash() {
  //   window.location = "/hospitaldashboard";
  // }

  render() {
    return (
      <>
        <div className="container w-100%">
          <div className="row pt-3">
          <div className="col-sm-6">
            <h2 className="text-capitalize text-dark ">Blood List</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>

          <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="col-4 text-center fs-5">Hospital Name</th>
                    <th className="col-1 text-center fs-5">A+</th>
                    <th className="col-1 text-center fs-5">A-</th>
                    <th className="col-1 text-center fs-5">B+</th>
                    <th className="col-1 text-center fs-5">B-</th>
                    <th className="col-1 text-center fs-5">O+</th>
                    <th className="col-1 text-center fs-5">O-</th>
                    <th className="col-1 text-center fs-5">AB+</th>
                    <th className="col-1 text-center fs-5">AB-</th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td className="col-4 text-center fs-5 fw-bold">{this.state.hospitalname}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.a_pos}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.a_neg}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.b_pos}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.b_neg}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.o_pos}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.o_neg}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.ab_pos}</td>
                      <td className="col-1 text-center fs-5 fw-bold">{this.state.ab_neg}</td>
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

export default BloodList;
