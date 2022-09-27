import React from 'react'
import { useEffect,useState } from 'react';
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from 'react-router';
import Swal from "sweetalert2";
import AdminServiceApi from '../service/AdminServiceApi.js';


const Updateuser = () => {
  const navigate=useNavigate();
  const{userid}=useParams();
  const [user,setUser]=useState({

    userid:userid,
    name: "",
    email: "",
    password: "",
    contact: "",
    address: "",
    gender: "",
    age: ""

  });

  // const onChange = (p) => {
  //   const value=p.target.value;
  //   setUser({...user,[p.target.name]:value});

  // };

  
  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const response=await AdminServiceApi.getById(userid);
        setUser(response.data);
      } catch(error){
        console.log(error);
      }
      };
      fetchData();
    },[]);

const UpdateUser=(e)=>{
  e.preventDefault();
  AdminServiceApi.updateUser(user,userid)
  .then((response)=>{
    Swal.fire({
      title: "User updated Successfully !!!",
      icon: "success",
      confirmButtonText: "Ok",
      timer: 1500
    });
    navigate("/viewuser");
  })
  .catch((error)=>{
    console.log(error);
   
  });
};

const handleChange=(e)=>{
  const value=e.target.value;
  setUser({...user,[e.target.name]:value});
};

  return (
    <>
      <div className="container-fluid signup row justify-content-center">
          <div
            className="col-sm-8 overflow-hidden border border-primary rounded"
            style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            <div className="row py-3">
              <div className="col-sm-8">
                <br />
                <h2 className="text-dark offset-5">Update User</h2>
              </div>
              <div className="col-sm-3">
                <br />
                <Link className="btn btn-dark offset-9 fw-bold" to="/viewuser">
                  Back
                </Link>
              </div>
            </div>
            <form className="mb-5">
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="name" className="col-2 col-form-label fw-bold">
                  Name
                </label>
                <div className="col-5">
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    placeholder="Enter your Full Name here !!!"
                    name="name"
                    value={user.name}
                    onChange={(e)=>handleChange(e)}                  
                    required
                  />
                  <p
                    className="text-center mt-3"
                    style={{ color: "red" }}
                    id="nameVr"
                  ></p>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="email" className="col-2 col-form-label fw-bold">
                  Email
                </label>
                <div className="col-5">
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="abc@xyz.com"
                    name="email"
                    value={user.email}
                    onChange={(e)=>handleChange(e)}  
                    required
                  />
                  <p
                    className="text-center mt-3"
                    style={{ color: "red" }}
                    id="emailVr"
                  ></p>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="pwd" className="col-2 col-form-label fw-bold">
                  Password
                </label>
                <div className="col-5">
                  <input
                    type="password"
                    id="pwd"
                    className="form-control"
                    placeholder="Enter your Password here !!!"
                    name="password"
                    value={user.password}
                    onChange={(e)=>handleChange(e)}
                    required
                  />
                  <p
                    className="text-center mt-3"
                    style={{ color: "red" }}
                    id="passwordVr"
                  ></p>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label className="col-2 col-form-label fw-bold">Gender</label>
                <div className="col-5 d-flex justify-content-between pt-2">
                  <div className="fw-bold">
                    <input                      
                      type="radio"
                      id="MALE"
                      name="gender"
                      value="MALE"
                      onChange={(e)=>handleChange(e)}
                    />
                    &nbsp;&nbsp;Male
                  </div>
                  <div className="fw-bold">
                    <input
                      type="radio"
                      id="FEMALE"
                      name="gender"
                      value="FEMALE"
                      onChange={(e)=>handleChange(e)}
                    />
                    &nbsp;&nbsp;Female
                  </div>
                  <div className="fw-bold">
                    <input
                      type="radio"
                      id="OTHER"
                      name="gender"
                      value="OTHER"
                      onChange={(e)=>handleChange(e)}
                    />
                    &nbsp;&nbsp;Other
                  </div>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label
                  htmlFor="contact"
                  className="col-2 col-form-label fw-bold"
                >
                  Contact
                </label>
                <div className="col-5">
                  <input
                    type="phone"
                    id="contact"
                    className="form-control"
                    placeholder="Enter your Contact details here !!!"
                    name="contact"
                    value={user.contact}
                    onChange={(e)=>handleChange(e)}
                    pattern="[0-9]{1}-[0-9]{5}-[0-9]{4}"
                    required
                  />
                  <p
                    className="text-center mt-3"
                    id="contactVr"
                    style={{ color: "red" }}
                  ></p>
                </div>
              </div>

              <div className="form-group row mt-3 justify-content-center">
                <label htmlFor="age" className="col-2 col-form-label fw-bold">
                  Age
                </label>
                <div className="col-5">
                  <input
                    type="number"
                    id="age"
                    className="form-control"
                    placeholder="Enter your Age here !!!"
                    name="age"
                    value={user.age}
                    onChange={(e)=>handleChange(e)}
                    required
                  />
                </div>
              </div>

              <div className="form-group row mt-3 justify-content-center">
                <label
                  htmlFor="address"
                  className="col-2 col-form-label fw-bold"
                >
                  Address
                </label>
                <div className="col-5">
                  <textarea
                    rows="3"
                    id="address"
                    className="form-control"
                    placeholder="Enter your Address here !!!"
                    name="address"
                    value={user.address}
                    onChange={(e)=>handleChange(e)}
                    required
                  ></textarea>
                </div>
              </div>
              <br />
              <div className="form-group justify-content-center">
                <div className="offset-5">
                  <Button
                    className="btn btn btn-success mt-3 fw-bold"
                    onClick={UpdateUser}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
    </>         
    );  
}

export default Updateuser;
