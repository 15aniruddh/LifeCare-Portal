import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import HospitalServiceApi from "../service/HospitalServiceApi.js";

var i;
class AddBlood extends Component {
  constructor(props) {
    super(props);
    this.i = 0;
    this.state = {
      a_pos: "",
      a_neg: "",
      b_pos: "",
      b_neg: "",
      ab_pos: "",
      ab_neg: "",
      o_pos: "",
      o_neg: "",
      message: null,
    };

    this.saveBlood = this.saveBlood.bind(this);
    this.loadhospital = this.loadhospital.bind(this);
  }

  componentDidMount() {
    this.loadhospital();
  }

  loadhospital() {
    let hosp = JSON.parse(sessionStorage.getItem("hospital"));
    console.log(hosp.id);
    i = hosp.id;
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  saveBlood = (e) => {
    if (
      this.state.a_pos === "" ||
      this.state.a_neg === "" ||
      this.state.b_pos === "" ||
      this.state.b_neg === "" ||
      this.state.ab_pos === "" ||
      this.state.ab_neg === "" ||
      this.state.o_pos === "" ||
      this.state.o_neg === ""
    ) {
      Swal.fire({
        title: "All Fields are Mandatory",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }

    e.preventDefault();
    let hospital = {
      a_pos: this.state.a_pos,
      a_neg: this.state.a_neg,
      b_pos: this.state.b_pos,
      b_neg: this.state.b_neg,
      ab_pos: this.state.ab_pos,
      ab_neg: this.state.ab_neg,
      o_pos: this.state.o_pos,
      o_neg: this.state.o_neg,
    };

    HospitalServiceApi.addBlood(i, hospital).then((res) => {
      this.setState({ message: "Blood details updated successfully." });
      console.log(this.state.message);
      Swal.fire({
        title: this.state.message,
        icon: "success",
        confirmButtonText: "Ok",
      });
      window.location = "/hospitaldashboard";
    });
  };

  // backtodash() {
  //   window.location = "/hospitaldashboard";
  // }
  render() {
    return (
      <>
        <div className="container w-100% hospitaldash">
          <div className="row pt-3">
          <div className="col-sm-6">
          <h2 className="text-capitalize text-dark offset-1">Add Blood</h2>
          </div>
          <div className="col-sm-6">
          <Link className="btn btn-dark offset-10 fw-bold" to="/hospitaldashboard">Back</Link> 
          </div>
          
          <form className="mb-5">
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="a_pos" className="col-3 col-form-label fs-5 fw-bold">
                A+ Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="a_pos"
                  className="form-control"
                  placeholder="A+ Blood Group"
                  name="a_pos"
                  value={this.state.a_pos}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="a_neg" className="col-3 col-form-label fs-5 fw-bold">
                A- Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="a_neg"
                  className="form-control"
                  placeholder="A- Blood Group"
                  name="a_neg"
                  value={this.state.a_neg}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="b_pos" className="col-3 col-form-label fs-5 fw-bold">
                B+ Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="b_pos"
                  className="form-control"
                  placeholder="B+ Blood Group"
                  name="b_pos"
                  value={this.state.b_pos}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="b_neg" className="col-3 col-form-label fs-5 fw-bold">
                B- Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="b_neg"
                  className="form-control"
                  placeholder="B- Blood Group"
                  name="b_neg"
                  value={this.state.b_neg}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="o_pos" className="col-3 col-form-label fs-5 fw-bold">
                O+ Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="o_pos"
                  className="form-control"
                  placeholder="O+ Blood Group"
                  name="o_pos"
                  value={this.state.o_pos}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="o_neg" className="col-3 col-form-label fs-5 fw-bold">
                O- Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="o_neg"
                  className="form-control"
                  placeholder="O- Blood Group"
                  name="o_neg"
                  value={this.state.o_neg}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="ab_pos" className="col-3 col-form-label fs-5 fw-bold">
                AB+ Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="ab_pos"
                  className="form-control"
                  placeholder="AB+ Blood Group"
                  name="ab_pos"
                  value={this.state.ab_pos}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
          <div className="form-group row my-3 justify-content-center">
                <label htmlFor="ab_neg" className="col-3 col-form-label fs-5 fw-bold">
                AB- Blood Group
                </label>
                <div className="col-5 p-1">
                <input
                  type="number"
                  id="ab_neg"
                  className="form-control"
                  placeholder="AB- Blood Group"
                  name="ab_neg"
                  value={this.state.ab_neg}
                  onChange={this.onChange}
                  required
                />
          </div>
          </div>
          <br />
              <div className="form-group justify-content-center">
                <div className="offset-5">
                  <Button
                    className="btn btn btn-primary mt-3 fw-bold"
                    onClick={this.saveBlood}
                  >
                    Add Blood
                  </Button>
                </div>
              </div>
              </form>
      </div>
      </div>







        
      </>
    );
  }
}

export default AddBlood;
