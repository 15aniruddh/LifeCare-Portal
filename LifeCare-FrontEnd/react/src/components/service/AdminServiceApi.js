import axios from "axios";

const ADMIN_API_BASE_URL = "http://localhost:9091/admin";
const USER_API_BASE_URL = "http://localhost:9091/user";
const HOSPITAL_API_BASE_URL = "http://localhost:9091/hospital";

class AdminServiceApi {
  addHospital(hospital) {
    return axios.post(ADMIN_API_BASE_URL + "/addhospital", hospital);
  }

  fetchAllHospitals() {
    return axios.get(ADMIN_API_BASE_URL + "/allhospitals");
  }

  fetchAllUsers() {
    return axios.get(ADMIN_API_BASE_URL + "/allusers");
  }

  getById(userid) {
    return axios.get(USER_API_BASE_URL + "/" + userid);
  }

  updateUser(user, userid) {
    return axios.put(USER_API_BASE_URL + "/updateuser/" + userid, user);
  }

  deleteUser(userid) {
    return axios.delete(USER_API_BASE_URL + "/deleteuser/" + userid);
  }

  getByhospId(hospid) {
    // "/{hospid}" is the alias the API documents for the admin screens.
    return axios.get(HOSPITAL_API_BASE_URL + "/" + hospid);
  }

  updateHospital(hospital, hospid) {
    return axios.put(HOSPITAL_API_BASE_URL + "/updatehospital/" + hospid, hospital);
  }

  deleteHospital(hospid) {
    return axios.delete(HOSPITAL_API_BASE_URL + "/deletehospital/" + hospid);
  }
}

const adminServiceApi = new AdminServiceApi();
export default adminServiceApi;
