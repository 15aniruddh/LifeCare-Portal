import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import AdminServiceApi from "../service/AdminServiceApi.js";
import { Link } from "react-router-dom";

class Hospitallist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hospitals: [],
      message: null,
    };

    this.reloadHospitalList = this.reloadHospitalList.bind(this);
  }

  componentDidMount() {
    this.reloadHospitalList();
  }

  reloadHospitalList() {
    AdminServiceApi.fetchAllHospitals().then((resp) => {
      this.setState({
        hospitals: resp.data,
        message: "Hospitals list rendered successfully",
      });
      console.log(this.state.message);
    });
  }

  deleteHospital(hospid) {
    
    AdminServiceApi.deleteHospital(hospid).then(res => {
        this.setState({ hospitals: this.state.hospitals.filter(hospital => hospital.hospid !== hospid) });
      toast.success('Delete Sucessfully !!!', {
       position: toast.POSITION.TOP_RIGHT
   }); 
 }
)} 

  // backtodash() {
  //   window.location = "/admindashboard";
  // }

  render() {
    return (
      <>
        <div className="container w-100%">
          <div className="row pt-3">
          <div className="col-sm-6">
            <h2 className="text-capitalize text-dark ">Hospital List</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/admindashboard">Back</Link> 
          </div>
          

          {this.state.hospitals.length === 0 ? (
            <h2 className="text-center" >No Hospital's in database</h2>
          ) : (
            <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="visually-hidden">Id</th>
                    <th className="col-2 text-center fs-5">Hospital Name</th>
                    <th className="col-3 text-center fs-5">Address</th>
                    <th className="col-2 text-center fs-5">Email</th>
                    <th className="col-1 text-center fs-5">Contact</th>
                    <th className="col-1 text-center fs-5">Ambulance Contact</th>                   
                    <th className="col-2 text-center fs-5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.hospitals.map((hospital) => (
                    <tr key={hospital.hospid}>
                      <td className="visually-hidden">{hospital.hospid}</td>
                      <td className="col-2 text-center fw-bold">{hospital.hospitalname}</td>
                      <td className="col-3 text-center fw-bold">{hospital.address}</td>
                      <td className="col-2 text-center fw-bold">{hospital.email}</td>
                      <td className="col-1 text-center fw-bold">{hospital.contact}</td>
                      <td className="col-1 text-center fw-bold">{hospital.ambulancecontact}</td>
                      <td className="col-2 justify-content-center">   
                        <Link className="btn btn-success" to={`/updatehospital/${hospital.hospid}`}>Update</Link>&nbsp;&nbsp;&nbsp;   
                        <Button onClick={() => this.deleteHospital(hospital.hospid)} className="btn btn-danger">Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <br />
        </div>       
      </>
    );
  }
}

export default Hospitallist;
