import React from 'react'
import { useEffect,useState } from 'react';
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from 'react-router';
import Swal from "sweetalert2";
import AdminServiceApi from '../service/AdminServiceApi.js';


const Updatehospital = () => {

  const navigate=useNavigate();
  const{hospid}=useParams();
  const [hospital,setHospital]=useState({

      hospid:hospid,
      hospitalname: "",
      email: "",
      password: "",
      contact: "",
      address: "",
      ambulancecontact: ""

  });

  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const response=await AdminServiceApi.getByhospId(hospid);
        setHospital(response.data);
      } catch(error){
        console.log(error);
      }
      };
      fetchData();
    },[]);

    const UpdateHospital=(e)=>{
      e.preventDefault();
      AdminServiceApi.updateHospital(hospital,hospid)
      .then((response)=>{
        Swal.fire({
          title: "User updated Successfully !!!",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1500
        });
        navigate("/viewhospital");
      })
      .catch((error)=>{
        console.log(error);
       
      });
    };

    const handleChange=(e)=>{
      const value=e.target.value;
      setHospital({...hospital,[e.target.name]:value});
    };


  return (   
      <>
       <div className="container pl-2">
          <div className="container-fluid row signup justify-content-center">
          <div
            className="col-sm-8 overflow-hidden border border-primary rounded"
            style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
          >
            <div className="row py-3">
            
              <div className="col-sm-8 mx-3">  
              <br />              
                <h2 className="text-dark offset-3">Update Hospital</h2>
              </div>
              <div className="col-sm-3">
              <br />
                <Link className="btn btn-dark offset-6 fw-bold" to="/viewhospital">Back</Link>
              </div>
            </div>
            <form className="mb-5">
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="name" className="col-3 col-form-label fw-bold">
                  Hospital Name
                </label>
                <div className="col-5">
                  <input
                    type="text"
                    id="hospitalname"
                    className="form-control"
                    placeholder="Enter your Hospital Name here !!!"
                    name="hospitalname"
                    value={hospital.hospitalname}
                    onChange={(e)=>handleChange(e)}
                    required
                  />
                  <p className="text-center mt-3" style={{ color: "red" }} id="nameVr"></p>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="email" className="col-3 col-form-label fw-bold">
                  Email
                </label>
                <div className="col-5">
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="abc@xyz.com"
                    name="email"
                    value={hospital.email}
                    onChange={(e)=>handleChange(e)}
                  />
                  <p className="text-center mt-3" style={{ color: "red" }} id="emailVr"></p>
                </div>
              </div>
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="pwd" className="col-3 col-form-label fw-bold">
                  Password
                </label>
                <div className="col-5">
                  <input
                    type="password"
                    id="pwd"
                    className="form-control"
                    placeholder="Enter your Password here !!!"
                    name="password"
                    value={hospital.password}
                    onChange={(e)=>handleChange(e)}
                    required
                  />
                  <p className="text-center mt-3" style={{ color: "red" }} id="passwordVr"></p>
                </div>
              </div>
              
              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="contact" className="col-3 col-form-label fw-bold">
                  Contact
                </label>
                <div className="col-5">
                  <input
                    type="phone"
                    id="contact"
                    className="form-control"
                    placeholder="Enter your Contact details here !!!"
                    name="contact"
                    value={hospital.contact}
                    onChange={(e)=>handleChange(e)}
                    pattern="[0-9]{1}-[0-9]{5}-[0-9]{4}"
                    required
                  />
                  <p className="text-center mt-3" id="contactVr" style={{ color: "red" }}></p>
                </div>
              </div>

              <div className="form-group row my-3 justify-content-center">
                <label htmlFor="contact" className="col-3 col-form-label fw-bold">
                  Ambulance Number
                </label>
                <div className="col-5">
                  <input
                    type="phone"
                    id="ambulancecontact"
                    className="form-control"
                    placeholder="Enter your Ambulance Number here !!!"
                    name="ambulancecontact"
                    value={hospital.ambulancecontact}
                    onChange={(e)=>handleChange(e)}
                    pattern="[0-9]{1}-[0-9]{5}-[0-9]{4}"
                    required
                  />
                  <p className="text-center mt-3" id="amcontactv" style={{ color: "red" }}></p>
                </div>
              </div>


              <div className="form-group row mt-3 justify-content-center">
                <label htmlFor="address" className="col-3 col-form-label fw-bold">
                  Address
                </label>
                <div className="col-5">
                  <textarea
                    rows="3"
                    id="address"
                    className="form-control"
                    placeholder="Enter your Address here !!!"
                    name="address"
                    value={hospital.address}
                    onChange={(e)=>handleChange(e)}
                    required>
                  </textarea>
                  <p className="text-center mt-3" style={{ color: "red" }} id="addressVr"></p>
                </div>
              </div>
              <br />
              <div className="form-group justify-content-center">
                <div className="offset-5">
                  <Button
                    className="btn btn btn-success mt-3 fw-bold"
                    onClick={UpdateHospital}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      </>
    );
  }

export default Updatehospital;
