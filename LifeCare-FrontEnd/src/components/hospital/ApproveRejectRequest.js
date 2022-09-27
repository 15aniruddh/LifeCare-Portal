import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
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
    RequestServiceApi.getAllPendingRequestforHospital(hosp.id).then((resp) => {
      this.setState({
        requests: resp.data,
        message: "Request list rendered successfully",
      });
      console.log(resp.data);
      console.log(this.state.message);
    });
  }

  acceptRequest(reqid) {
    console.log(reqid);
    console.log(typeof reqid);

    RequestServiceApi.acceptrejectPendingRequest("accepted", reqid).then(
      (res) => {
        this.setState({ message: "Request Accepted successfully." });
        console.log(this.state.message);
        Swal.fire({
          title: this.state.message,
          icon: "success",
          confirmButtonText: "Ok",
        });
        window.location = "/hospitaldashboard";
      }
    );
  }

  rejectRequest(reqid) {
    console.log(reqid);

    RequestServiceApi.acceptrejectPendingRequest("rejected", reqid).then(
      (res) => {
        this.setState({ message: "Request Rejected successfully." });
        console.log(this.state.message);
        Swal.fire({
          title: this.state.message,
          icon: "success",
          confirmButtonText: "Ok",
        });
        window.location = "/hospitaldashboard";
      }
    );
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
                    <th className="col-4 text-center fs-5">Symptoms</th>
                    <th className="col-2 text-center fs-5">Time of Arrival</th>
                    <th className="col-3 text-center fs-5">Action</th>
                  </tr>
                </thead>
                <tbody>
                {this.state.requests.map((request) => (
                    <tr key={request.reqid}>
                      <td className="col-3 text-center fs-5 fw-bold">{request.bedtype}</td>
                      <td className="col-4 text-center fs-5 fw-bold">{request.symptoms}</td>
                      <td className="col-2 text-center fs-5 fw-bold">{request.timetoarrive}</td>
                      <td className="col-3 text-center fs-5 fw-bold">   
                        <Button className="btn btn-success" onClick={() => this.acceptRequest(request.reqid)} >Accept</Button>                     
                        <Button onClick={() => this.rejectRequest(request.reqid)} className="btn btn-danger offset-1">Decline</Button>
                      </td>
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
