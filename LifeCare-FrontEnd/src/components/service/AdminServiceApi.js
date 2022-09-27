import axios from "axios";

const ADMIN_API_BASE_URL = "http://localhost:9091/admin";

class AdminServiceApi {
  addHospital(hospital) {
    console.log(hospital);
    return axios.post(ADMIN_API_BASE_URL + "/addhospital", hospital);
  }

  fetchAllHospitals() {
    return axios.get(ADMIN_API_BASE_URL + "/allhospitals");
  }
  fetchAllUsers() {
    return axios.get(ADMIN_API_BASE_URL + "/allusers");
  }

  fetchdeleteUser(userid) {
    return axios.delete(ADMIN_API_BASE_URL + "/deleteuser" + userid);
}

  deleteUser(userid) {
  return axios.delete("http://localhost:9091/user/deleteuser/" + userid);
}

  logoutAdmin() {
    sessionStorage.removeItem("admin");
}

  getById(userid) {
    return axios.get("http://localhost:9091/user/" + userid);
}

  updateUser(user,userid){
  return axios.put("http://localhost:9091/user/updateuser/"+ userid,user);
}

  getByhospId(hospid) {
    return axios.get("http://localhost:9091/hospital/" + hospid);
}

  updateHospital(hospital,hospid){
  return axios.put("http://localhost:9091/hospital/updatehospital/"+ hospid,hospital);
}

fetchdeleteHospital(hospid) {
  return axios.delete(ADMIN_API_BASE_URL + "/deletehospital" + hospid);
}

deleteHospital(hospid) {
return axios.delete("http://localhost:9091/hospital/deletehospital/" + hospid);
}

}

export default new AdminServiceApi();
