import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { toast } from 'react-toastify';
import AdminServiceApi from "../service/AdminServiceApi.js";


class Userlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      message: null,
    };

    this.reloadUserList = this.reloadUserList.bind(this);
   // this.edituser=this.edituser.bind(this);
  }
  

  componentDidMount() {
    this.reloadUserList();
  }

  reloadUserList() {
    AdminServiceApi.fetchAllUsers().then((resp) => {
      this.setState({
        users: resp.data,
        message: "User list rendered successfully !!!",
      });
      console.log(this.state.message);
    });
  }

  // backtodash() {
  //   window.location = "/admindashboard";
  // }

  deleteUser(userid) {
    
     AdminServiceApi.deleteUser(userid).then(res => {
         this.setState({ users: this.state.users.filter(user => user.userid !== userid) });
       toast.success('Delete Sucessfully !!!', {
        position: toast.POSITION.TOP_RIGHT
    }); 
  }
)} 

  render() {
    return (
      <>
        <div className="container w-100%">
          <div className="row pt-3">
          <div className="col-sm-6">
            <h2 className="text-capitalize text-dark ">User List</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-11 fw-bold" to="/admindashboard">Back</Link> 
          </div>
          

          {this.state.users.length === 0 ? (
            <h2 className="text-center" >No User's in database</h2>
          ) : (
            <div>
              <br />
              <table className="table table-bordered">
                <thead className="bg-primary text-light">
                  <tr>
                    <th className="visually-hidden">Id</th>
                    <th className="col-2 text-center fs-5">Name</th>
                    <th className="col-2 text-center fs-5">Email</th>
                    <th className="col-1 text-center fs-5">Contact</th>                    
                    <th className="col-3 text-center fs-5">Address</th>
                    <th className="col-1 text-center fs-5">Gender</th>
                    <th className="col-1 text-center fs-5">Age</th>
                    <th className="col-2 text-center fs-5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.users.map((user) => (
                    <tr key={user.userid}>
                      <td className="visually-hidden">{user.userid}</td>
                      <td className="col-2 text-center fw-bold">{user.name}</td>
                      <td className="col-2 text-center fw-bold">{user.email}</td>
                      <td className="col-1 text-center fw-bold">{user.contact}</td>                      
                      <td className="col-3 text-center fw-bold">{user.address}</td>
                      <td className="col-1 text-center fw-bold">{user.gender}</td>
                      <td className="col-1 text-center fw-bold">{user.age}</td>
                      <td className="col-2 text-center fw-bold">   
                        <Link className="btn btn-success" to={`/updateuser/${user.userid}`}>Update</Link>&nbsp;               
                        <Button onClick={() => this.deleteUser(user.userid)} className="btn btn-danger">Delete </Button>
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

export default Userlist;