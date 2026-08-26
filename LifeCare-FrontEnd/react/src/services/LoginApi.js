import axios from "axios";

import { API_BASE_URL } from "./apiConfig";

const USER_LOGIN_BASE_URL = `${API_BASE_URL}/login`;

class LoginApi {
  loginUser(user) {
    return axios.post(USER_LOGIN_BASE_URL + "/userlogin", user);
  }

  /** Which sign-in methods this backend offers, e.g. `{password, google}`.
   *  Google only reports true once the server has its OAuth credentials, so
   *  the login page can keep the button hidden until it would actually work. */
  getProviders() {
    return axios.get(USER_LOGIN_BASE_URL + "/providers");
  }

  /** Start Sign in with Google.
   *
   *  This is a full-page browser redirect, not an XHR: the browser has to
   *  visit Google itself, and Google refuses to be loaded in a frame or
   *  fetched cross-origin. The backend finishes by redirecting to
   *  /login/google/callback in this app.
   */
  startGoogleLogin() {
    window.location.assign(USER_LOGIN_BASE_URL + "/google");
  }
}

const loginApi = new LoginApi();
export default loginApi;
