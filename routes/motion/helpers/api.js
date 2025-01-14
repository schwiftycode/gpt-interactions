const axios = require("axios");

/**
 * Axios instance configured for Motion API requests
 * @constant {import('axios').AxiosInstance}
 */
const motionApi = axios.create({
  baseURL: "https://api.usemotion.com/v1",
  headers: {
    "X-API-Key": process.env.MOTION_API_KEY,
    "Content-Type": "application/json",
  },
});

module.exports = motionApi;
