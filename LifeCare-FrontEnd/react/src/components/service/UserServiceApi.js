import axios from "axios";

const USER_API_BASE_URL = "http://localhost:9091/user";

class UserServiceApi {
  addUser(user) {
    return axios.post(USER_API_BASE_URL + "/adduser", user);
  }

}

const userServiceApi = new UserServiceApi();
export default userServiceApi;
