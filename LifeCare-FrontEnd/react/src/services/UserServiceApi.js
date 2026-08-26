import axios from "axios";

import { API_BASE_URL } from "./apiConfig";

const USER_API_BASE_URL = `${API_BASE_URL}/user`;

const userServiceApi = {
  addUser(user) {
    return axios.post(USER_API_BASE_URL + "/adduser", user);
  },

  getById(userid) {
    return axios.get(USER_API_BASE_URL + "/" + userid);
  },

  updateUser(user, userid) {
    return axios.put(USER_API_BASE_URL + "/updateuser/" + userid, user);
  },

  deleteUser(userid) {
    return axios.delete(USER_API_BASE_URL + "/deleteuser/" + userid);
  },
};

export default userServiceApi;
