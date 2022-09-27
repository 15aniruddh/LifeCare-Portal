import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import RequestServiceApi from "../service/RequestServiceApi.js";

export default class ViewRequest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
      message: null,
    };

    this.reloadRequestList = this.reloadRequestList.bind(this);
  }

  componentDidMount() {
    this.reloadRequestList();
  }

  reloadRequestList() {
    let hosp = JSON.parse(sessionStorage.getItem("hospital"));
    console.log(hosp);
    RequestServiceApi.getAllRequestforHospital(hosp.id).then((resp) => {
      this.setState({
        requests: resp.data,
        message: "Request list rendered successfully",
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
            <h2 className="text-capitalize text-dark ">Request List</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>

          <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="col-3 text-center fs-5">Type of Bed</th>
                    <th className="col-3 text-center fs-5">Symptoms</th>
                    <th className="col-3 text-center fs-5">Time of Arrival</th>
                    <th className="col-3 text-center fs-5">Status</th>
                  </tr>
                </thead>
                <tbody>
                {this.state.requests.map((request) => (
                    <tr>                  
                      <td className="col-3 text-center fs-5 fw-bold">{request.bedtype}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{request.symptoms}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{request.timetoarrive}</td>
                      <td className="col-3 text-center fs-5 fw-bold">{request.status}</td>                      
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
