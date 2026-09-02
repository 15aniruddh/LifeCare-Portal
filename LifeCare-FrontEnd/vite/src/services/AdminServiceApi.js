import axios from "axios";

import { API_BASE_URL } from "./apiConfig";

const ADMIN_API_BASE_URL = `${API_BASE_URL}/admin`;

/** The three admin-only routes. User and hospital records are reached through
 *  UserServiceApi and HospitalServiceApi, which own those endpoints. */
const adminServiceApi = {
  addHospital(hospital) {
    return axios.post(ADMIN_API_BASE_URL + "/addhospital", hospital);
  },

  fetchAllHospitals() {
    return axios.get(ADMIN_API_BASE_URL + "/allhospitals");
  },

  fetchAllUsers() {
    return axios.get(ADMIN_API_BASE_URL + "/allusers");
  },
};

export default adminServiceApi;
