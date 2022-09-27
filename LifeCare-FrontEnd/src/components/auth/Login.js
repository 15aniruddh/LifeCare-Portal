import React, { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";
import LoginApi from "../service/LoginApi.js";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate=useNavigate();
   const [email,setEmail]=useState("");
   const[password,setPassword]=useState("");
   const[message,setMessage]=useState("");  


const login = (e) => {
    if (password === "" || email === "") {
      Swal.fire({
        title: "Please fill the Credentials !!!",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    e.preventDefault();
    let user = {
      email: email,
      password: password,
    };
    console.log(user.email);  
    console.log(user.password);
    
    LoginApi.loginUser(user)
      .then((response) => {
        console.log(response.data.role);
        setMessage("Login succesfull!!")
        console.log(message);
        if (response.data.role === "admin") {
          sessionStorage.setItem("admin", JSON.stringify(response.data));
          console.log(response.data);
          navigate('/admindashboard');
        } else if (response.data.role === "hospital") {
          sessionStorage.setItem("hospital", JSON.stringify(response.data));
          console.log(response.data);
          navigate('/hospitaldashboard');
        } else {
          sessionStorage.setItem("user", JSON.stringify(response.data));
          navigate('/userdashboard');
        }
      })
      .catch((error) => {
        console.error("in err ", error.response.data);

        Swal.fire({
          title: "Error",
          icon: "error",
          confirmButtonText: "Ok",
        });
      });
  }

 const validateEmail=() =>{
    let email = document.getElementById("email").value;
    let emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(email) === true || email === "") {
      return true;
    } else {
      document.getElementById("emailVR").innerHTML =
        "Email format should be in abc@xyz.com";
      return false;
    }
  }

 const  removeAlert=() =>{
    document.getElementById("emailVR").innerHTML = "";
  }
  

  
    return (
      <>
        <div className="container-fluid login">
          <div className="pt-5">
            <form
              className="container  border border-primary shadow-lg p-3 mb-5 rounded"
              style={{ width: "28vw" , marginTop: "5%"}}
            >
              <h2 className="text text-center mb-3">Login</h2>  
              <hr />
              <br />            
              <div className="form-group">
                <input
                  id="email"
                  type="email"
                  className="form-control text-center py-2"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e)=>{setEmail(e.target.value)}}
                  onBlur={()=>{validateEmail()}}
                  onFocus={()=>{removeAlert()}}
                  required
                />
                <p className="text-center mt-3" style={{ color: "red" }} id="emailVR"></p>
              </div>
              <br />
              <div className="form-group">
                <input
                  type="password"
                  className="form-control text-center py-2"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e)=>{setPassword(e.target.value)}}
                  required
                />
              </div>
              <br />
              <div className="justify-content-center text-center">                
                  <Button className="btn btn-primary ms-auto fs-6 px-4" onClick={(e)=>{login(e)}}>
                    <b>Login</b>
                  </Button>                
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
