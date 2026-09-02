import axios from "axios";

import { API_BASE_URL } from "./apiConfig";

const REQUEST_API_BASE_URL = `${API_BASE_URL}/request`;

const requestServiceApi = {
  addRequest(userid, hospid, request) {
    return axios.post(
      REQUEST_API_BASE_URL + "/addrequest/" + userid + "/" + hospid,
      request
    );
  },

  acceptrejectPendingRequest(status, reqid) {
    return axios.put(
      REQUEST_API_BASE_URL + "/acceptrequest/" + status + "/" + reqid
    );
  },

  getAllPendingRequestforHospital(hospid) {
    return axios.get(REQUEST_API_BASE_URL + "/pendingrequest/" + hospid);
  },

  getAllRequestByUser(userid) {
    return axios.get(REQUEST_API_BASE_URL + "/requestbyuser/" + userid);
  },

  getAllRequestforHospital(hospid) {
    return axios.get(REQUEST_API_BASE_URL + "/requestforhosp/" + hospid);
  },
};

export default requestServiceApi;
