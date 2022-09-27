import React, { Component } from "react";
import { Link } from "react-router-dom";
import RequestServiceApi from "../service/RequestServiceApi.js";

export default class Bookingstatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
      message: null,
    };

    this.reloadHospitalList = this.reloadHospitalList.bind(this);
  }

  componentDidMount() {
    this.reloadHospitalList();
  }

  reloadHospitalList() {
    let u = JSON.parse(sessionStorage.getItem("user"));
    console.log(u);
    RequestServiceApi.getAllRequestByUser(u.id).then((resp) => {
      this.setState({
        requests: resp.data,
        message: "Request list rendered successfully",
      });
      console.log(resp.data);
      console.log(this.state.message);
    });
  }

  // backtodash() {
  //   window.location = "/userdashboard";
  // }

  render() {
    return (
      <>
        <div className="container w-100%">
          <div className="row pt-3">
          <div className="col-sm-6">
            <h2 className="text-capitalize text-dark ">Request List</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/userdashboard">Back</Link> 
          </div>

          <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="col-3 text-center fs-5">Type of Bed</th>
                    <th className="col-5 text-center fs-5">Symptoms</th>
                    <th className="col-2 text-center fs-5">Time of Arrival</th>
                    <th className="col-2 text-center fs-5">Status</th>
                  </tr>
                </thead>
                <tbody>
				            {this.state.requests.map((request) => (
                    <tr>
                      <td className="col-3 text-center fs-5 fw-bold">{request.bedtype}</td>
                      <td className="col-5 text-center fs-5 fw-bold">{request.symptoms}</td>
                      <td className="col-2 text-center fs-5 fw-bold">{request.timetoarrive}</td>
                      <td className="col-2 text-center fs-5 fw-bold">{request.status}</td>
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
