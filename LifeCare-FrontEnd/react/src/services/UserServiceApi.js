import axios from "axios";

import { API_BASE_URL } from "./apiConfig";

const USER_API_BASE_URL = `${API_BASE_URL}/user`;

class UserServiceApi {
  addUser(user) {
    return axios.post(USER_API_BASE_URL + "/adduser", user);
  }

}

const userServiceApi = new UserServiceApi();
export default userServiceApi;
