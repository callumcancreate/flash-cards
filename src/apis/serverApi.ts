import axios from "axios";

const server = axios.create({
  baseURL: "/api/v1"
});

export default server;
