import React, { Component } from "react";
import { Link } from "react-router-dom";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

class BedList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hospitalname: "",
      ventilator: "",
      oxygen: "",
      normal: "",
      message: null,
    };

    this.reloadHospitalList = this.reloadHospitalList.bind(this);
  }

  componentDidMount() {
    this.reloadHospitalList();
  }

  reloadHospitalList() {
    let hosp = JSON.parse(sessionStorage.getItem("hospital"));
    console.log(hosp);
    HospitalServiceApi.getHospitalById(hosp.id).then((resp) => {
      let hospital = resp.data;
      this.setState({
        hospitalname: hospital.hospitalname,
        ventilator: hospital.ventilator,
        oxygen: hospital.oxygen,
        normal: hospital.normal,
        message: "Hospital's list rendered Successfully !!!",
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
            <h2 className="text-capitalize text-dark ">Bed List</h2>
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
                    <th className="col-3 text-center fs-5">Bed with Ventilator</th>
                    <th className="col-3 text-center fs-5">Bed with Oxygen Cylinder</th>
                    <th className="col-2 text-center fs-5">Normal Bed</th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td className="col-4 text-center fs-5 fw-bold">{this.state.hospitalname}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{this.state.ventilator}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{this.state.oxygen}</td>
                      <td className="col-2 text-center fs-5 fw-bold">{this.state.normal}</td>
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

export default BedList;
