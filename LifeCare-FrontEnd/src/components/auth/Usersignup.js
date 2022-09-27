import React, { Component, useState } from "react";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import UserServiceApi from "../service/UserServiceApi";
import { useNavigate} from "react-router";

export default function Usersignup(){
  const navigate=useNavigate();

  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[contact,setContact]=useState("");
  const[address,setAddress]=useState("");
  const[gender,setgender]=useState("");
  const[age,setAge]=useState("");
  const[message,setMessage]=useState("");

 const validateName=()=> {
    let name = document.getElementById("name").value;
    var regexname = /^[a-zA-Z]+ [a-zA-Z]+$/;
    if (regexname.test(name) === true) {
      document.getElementById("nameVr").innerHTML = "";
      return true;
    } else {
      document.getElementById("nameVr").innerHTML =
        "Name must be in Alphabets !!!";
    }
  }
  
 const validatePassword=()=> {
  let password = document.getElementById("pwd").value;
    var regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{5,}$/;

    if (regexPassword.test(password) === true) {
      document.getElementById("passwordVr").innerHTML = "";
      return true;
    } else {
      document.getElementById("passwordVr").innerHTML =
        "Password must be in alphanumeric and should contains at least a special character with length 5 !!!";
    }
  }

  const validateEmail=()=> {
    let email = document.getElementById("email").value;

    var regexEmail = /\S+@\S+\.\S+/;
    if (regexEmail.test(email) === true) {
      document.getElementById("emailVr").innerHTML = "";
      return true;
    } else {
      document.getElementById("emailVr").innerHTML =
        "Email format should be in 'abc@gmail.com' !!!";
    }
  }

  const validateMobileNumber=()=> {
    let number = document.getElementById("contact").value;
    var regexMobile = /^\d{10}$/;
    if (regexMobile.test(number)) {
      document.getElementById("contactVr").innerHTML = "";
    } else {
      document.getElementById("contactVr").innerHTML =
        "Phone number must be of 10 digits !!!";

      return false;
    }
  }

 const removeWarnings=()=> {
    document.getElementById("nameVr").innerHTML = "";
    document.getElementById("passwordVr").innerHTML = "";
    document.getElementById("emailVr").innerHTML = "";
    document.getElementById("contactVr").innerHTML = "";
  }

 const signUp = (e) => {
    if (
      name === "" ||
      email === "" ||
      password === "" ||
      contact === "" ||
      address === "" ||
      gender === "" ||
      age === ""
    ) {
      Swal.fire({
        title: "All Fields are Mandatory",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    var regexname = /^[a-zA-Z]+ [a-zA-Z]+$/;
    if (regexname.test(name) === false) {
      Swal.fire({
        title: "Enter valid Name",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }

    var regexEmail = /\S+@\S+\.\S+/;
    if (regexEmail.test(email) === false) {
      Swal.fire({
        title: "Enter valid Email",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    var regexPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{5,}$/;
    if (regexPassword.test(password) === false) {
      Swal.fire({
        title: "Enter valid Password",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    var regexMobile = /^\(?([7-9]{1})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{4})$/;
    if (regexMobile.test(contact) === false) {
      Swal.fire({
        title: "Enter valid Contact",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }

    e.preventDefault();
    let user = {
      name: name,
      email:email,
      password: password,
      contact: contact,
      address:address,
      gender:gender,
      age: age,
    };

    UserServiceApi.addUser(user)
      .then((res) => {
        console.log(res.data);
        setMessage("Login succesfull !!!")
        console.log(message);
        Swal.fire({
          title: "User added Successfully !!!",
          icon: "success",
          confirmButtonText: "Ok",
        });
        navigate('/');
      })
      .catch((error) => {
        console.error("Error", error.res.data);
        Swal.fire({
          title: "Error",
          icon: "error",
          confirmButtonText: "Ok",
        });
      });
  };


    return (
      <>
      <div className="container">
        <div className="container signup row justify-content-center">
          <div
            className="col-sm-8 overflow-hidden border border-primary rounded"
            style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
            <div className="row py-3">
              <div className="col-sm-8">
                <br />
                <h2 className="text-dark offset-5">User Registration</h2>
              </div>
              <div className="col-sm-3">
                <br />
                <Link className="btn btn-dark offset-9 fw-bold" to="/">
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
                    value={name}
                    onChange={(e)=>{setName(e.target.value)}}
                    onFocus={()=>{removeWarnings()}}
                    onBlur={()=>{validateName()}}
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
                    value={email}
                    onChange={(e)=>{setEmail(e.target.value)}}
                    onFocus={()=>{removeWarnings()}}
                    onBlur={()=>{validateEmail()}}
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
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}}
                    onFocus={()=>{removeWarnings()}}
                    onBlur={()=>{validatePassword()}}
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
                      onChange={(e)=>{setgender(e.target.value)}}
                    />
                    &nbsp;&nbsp;Male
                  </div>
                  <div className="fw-bold">
                    <input
                      type="radio"
                      id="FEMALE"
                      name="gender"
                      value="FEMALE"
                      onChange={(e)=>{setgender(e.target.value)}}
                    />
                    &nbsp;&nbsp;Female
                  </div>
                  <div className="fw-bold">
                    <input
                      type="radio"
                      id="OTHER"
                      name="gender"
                      value="OTHER"
                      onChange={(e)=>{setgender(e.target.value)}}
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
                    value={contact}
                    pattern="[0-9]{1}-[0-9]{5}-[0-9]{4}"
                    onChange={(e)=>{setContact(e.target.value)}}
                    onFocus={()=>{removeWarnings()}}
                    onBlur={()=>{validateMobileNumber()}}
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
                    value={age}
                    onChange={(e)=>{setAge(e.target.value)}}
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
                    value={address}
                    onChange={(e)=>{setAddress(e.target.value)}}
                    required
                  ></textarea>
                </div>
              </div>
              <br />
              <div className="form-group justify-content-center">
                <div className="offset-5">
                  <Button
                    className="btn btn btn-primary mt-3 fw-bold"
                    onClick={(e)=>{signUp(e)}}
                  >
                    Sign Up
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