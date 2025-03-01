import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://saas-server.loca.lt/api",
});

export default axiosInstance;
