import React, { Component } from "react";
import { Link } from "react-router-dom";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

class DoctorInfoList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      doctors: [],
      message: null,
    };

    this.reloadDoctorList = this.reloadDoctorList.bind(this);
  }

  componentDidMount() {
    this.reloadDoctorList();
  }

  reloadDoctorList() {
    let hosp = JSON.parse(sessionStorage.getItem("hospital"));
    HospitalServiceApi.getDoctorsByHospId(hosp.id).then((resp) => {
      this.setState({
        doctors: resp.data,
        message: "Doctors list rendered successfully",
      });
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
            <h2 className="text-capitalize text-dark ">Doctor Info List</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>

          <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="visually-hidden">Id</th>
                    <th className="col-3 text-center fs-5">Name</th>
                    <th className="col-3 text-center fs-5">Email</th>
                    <th className="col-3 text-center fs-5">Qualification</th>
                    <th className="col-3 text-center fs-5">Specialization</th>
                  </tr>
                </thead>
                <tbody>
                {this.state.doctors.map((doctor) => (
                  <tr key={doctor.doctorid}>
                      <td className="visually-hidden">{doctor.doctorid}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{doctor.name}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{doctor.email}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{doctor.qualification}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{doctor.specialization}</td>
                    </tr>
                  ))}
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

export default DoctorInfoList;
