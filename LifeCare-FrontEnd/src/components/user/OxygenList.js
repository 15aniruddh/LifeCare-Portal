import React, { Component } from "react";
import { Link } from "react-router-dom";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

class OxygenList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hospitalname: "",
      oxygenavailable: "",
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
        oxygenavailable: hospital.oxygenavailable,
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
            <h2 className="text-capitalize text-dark ">Oxygen Cylinder List</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>

          <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="col-8 text-center fs-5">Hospital Name</th>
                    <th className="col-4 text-center fs-5">Oxygen Cylinder Available</th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td className="col-8 text-center fs-5 fw-bold">{this.state.hospitalname}</td>
                      <td className="col-4 text-center fs-5 fw-bold">{this.state.oxygenavailable}</td>
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

export default OxygenList;
