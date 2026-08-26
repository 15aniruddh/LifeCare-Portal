import axios from "axios";

import { API_BASE_URL } from "./apiConfig";

const HOSPITAL_API_BASE_URL = `${API_BASE_URL}/hospital`;

class HospitalServiceApi {
  addBed(id, hospital) {
    return axios.put(HOSPITAL_API_BASE_URL + "/addbed/" + id, hospital);
  }

  addBlood(id, hospital) {
    return axios.put(HOSPITAL_API_BASE_URL + "/addblood/" + id, hospital);
  }

  addOxygen(id, hospital) {
    return axios.put(HOSPITAL_API_BASE_URL + "/addoxygen/" + id, hospital);
  }

  addDoctorinfo(id, doctor) {
    return axios.post(HOSPITAL_API_BASE_URL + "/adddoctorinfo/" + id, doctor);
  }

  getAllHospitals() {
    return axios.get(HOSPITAL_API_BASE_URL + "/all");
  }

  getHospitalById(id) {
    return axios.get(HOSPITAL_API_BASE_URL + "/hospitalid/" + id);
  }

  getDoctorsByHospId(id) {
    return axios.get(HOSPITAL_API_BASE_URL + "/doctorinfo/" + id);
  }

}

const hospitalServiceApi = new HospitalServiceApi();
export default hospitalServiceApi;
